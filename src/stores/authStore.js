import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isRegistering: false,
      registrationData: null,
      error: null,

      //* Computed values
      isAuthenticated: () => {
        const user = get().user;
        return (
          user !== null &&
          (user.is_active === 1 || user?.is_active === true) &&
          (user.is_verified === 1 || user?.is_verified === true)
        );
      },

      isVerified: () => {
        const user = get().user;
        return user?.is_verified === 1;
      },

      requiresVerification: () => {
        const user = get().user;
        return user !== null && user.is_verified === 0;
      },

      getUserType: () => {
        return get().user?.user_type || get().user?.u_type || null;
      },

      getProfilePicture: () => {
        const user = get().user;
        return user?.profile_picture || null;
      },

      hasRole: (roles) => {
        const userType = get().getUserType();
        if (!userType) return false;

        if (typeof roles === "string") {
          return userType === roles;
        }
        return roles.includes(userType);
      },

      //* Registration actions
      startRegistration: () => {
        set({ isRegistering: true, error: null });
      },

      finishRegistration: (apiResponse) => {
        const userData = apiResponse?.data?.data?.data;

        if (userData) {
          const userType =
            userData.business_name || userData.business_type
              ? "landlord"
              : "rentor";

          set({
            user: {
              id: userData.id,
              user_slug: userData.user_slug || userData.landlord_slug,
              landlord_slug: userData.landlord_slug,
              full_name: userData.full_name,
              email: userData.email,
              phone_number: userData.phone_number,
              gender: userData.gender,
              is_active: userData.is_active,
              is_verified: userData.is_verified,
              verification_channel: userData.verification_channel,
              profile_picture: userData.profile_picture,
              verified_at: userData.verified_at,
              user_type: userType,
              //Todo => Landlord specific fields
              business_name: userData.business_name,
              business_type: userData.business_type,
              business_registration: userData.business_registration,
              business_registration_number:
                userData.business_registration_number,
              business_logo: userData.business_logo,
              location: userData.location,
              region: userData.region,
            },
            registrationData: {
              message: apiResponse?.data?.message,
              reason: apiResponse?.data?.reason,
              point_in_time: apiResponse?.data?.point_in_time,
            },
            isRegistering: false,
            error: null,
          });
        } else {
          set({
            error: "Invalid registration response",
            isRegistering: false,
          });
        }
      },

      registrationError: (errorMessage) => {
        set({
          error: errorMessage,
          isRegistering: false,
        });
      },

      //* Authentication actions
      startLogin: () => {
        set({ isLoading: true, error: null });
      },

      finishLogin: (apiResponse) => {
        //Todo => Handle both direct user data and nested API response structure
        const userData = apiResponse?.user || apiResponse?.data?.data?.data;

        if (userData) {
          //Todo => Determine user type - check explicit user_type first
          const userType = userData.user_type || 
            (userData.business_name ? "landlord" : "rentor");

          // Admin-specific user object structure
          if (userType === "admin") {
            set({
              user: {
                id: userData.id,
                admin_slug: userData.admin_slug,
                full_name: userData.full_name,
                email: userData.email,
                phone_number: userData.phone_number,
                user_type: userData.user_type,
                is_active: userData.is_active,
                is_verified: 1,
                token: userData.token,
                remember_token: userData.remember_token,
                displayName: userData.full_name,
                isAccountActive: userData.is_active === 1,
              },
              isLoading: false,
              error: null,
            });
          } else {
            // Regular user (landlord/renter) structure
            set({
              user: {
                id: userData.id,
                user_slug: userData.user_slug || userData.landlord_slug,
                landlord_slug: userData.landlord_slug,
                full_name: userData.full_name,
                email: userData.email,
                phone_number: userData.phone_number,
                gender: userData.gender,
                is_active: userData.is_active,
                is_verified: userData.is_verified,
                verification_channel: userData.verification_channel,
                profile_picture: userData.profile_picture,
                verified_at: userData.verified_at,
                token: userData.token,
                user_type: userType,
                //Todo => Landlord specific fields
                business_name: userData.business_name,
                business_type: userData.business_type,
                business_registration: userData.business_registration,
                business_registration_number:
                  userData.business_registration_number,
                business_logo: userData.business_logo,
                location: userData.location,
                region: userData.region,
                properties_count: userData.properties_count,
                displayName: userData.displayName || userData.full_name,
                businessDisplayName:
                  userData.businessDisplayName || userData.business_name,
                isBusinessVerified:
                  userData.isBusinessVerified || userData.is_verified === 1,
                isAccountActive:
                  userData.isAccountActive || userData.is_active === 1,
                hasCompletedProfile:
                  userData.hasCompletedProfile ||
                  !!(userData.business_name && userData.business_type),
              },
              isLoading: false,
              error: null,
            });
          }
        } else {
          set({
            error: "Invalid login response",
            isLoading: false,
          });
        }
      },

      loginError: (errorMessage) => {
        set({
          error: errorMessage,
          isLoading: false,
        });
      },

      login: (userData) => {
        set({ user: userData, isLoading: false, error: null });
      },

      logout: () => {
        set({
          user: null,
          isLoading: false,
          registrationData: null,
          error: null,
        });

        //Todo => Clear any stored tokens or session data
        localStorage.removeItem("quick_renter_token");
        localStorage.removeItem("quick_landlord_token");
        localStorage.removeItem("quick_admin_token");
        localStorage.removeItem("quick_admin_user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      //* User verification
      markAsVerified: () => {
        set((state) => ({
          user: state.user ? { ...state.user, is_verified: 1 } : null,
        }));
      },

      completeVerification: (verificationData) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                is_verified: verificationData.is_verified || 1,
                verified_at: verificationData.verified_at,
                token: verificationData.token,
                //Todo => Update landlord-specific fields if present
                ...(verificationData.business_logo && {
                  business_logo: verificationData.business_logo,
                }),
                ...(verificationData.business_name && {
                  business_name: verificationData.business_name,
                }),
                ...(verificationData.business_type && {
                  business_type: verificationData.business_type,
                }),
                ...(verificationData.business_registration_number && {
                  business_registration_number:
                    verificationData.business_registration_number,
                }),
                ...(verificationData.location && {
                  location: verificationData.location,
                }),
                ...(verificationData.region && {
                  region: verificationData.region,
                }),
                ...(verificationData.landlord_slug && {
                  landlord_slug: verificationData.landlord_slug,
                }),
                ...verificationData,
              }
            : null,
        }));
      },

      //* Loading states
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      //* Error handling
      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      //* Initialize auth state
      initializeAuth: () => {
        set({ isLoading: false, error: null });
      },

      //* Clear all auth data
      clearAuth: () => {
        set({
          user: null,
          isLoading: false,
          isRegistering: false,
          registrationData: null,
          error: null,
        });
      },

      //* Route protection helpers
      canAccessRoute: (requiredRoles = []) => {
        const store = get();
        if (!store.isAuthenticated()) return false;
        if (requiredRoles.length === 0) return true;
        return store.hasRole(requiredRoles);
      },

      getRedirectPath: () => {
        const store = get();
        if (!store.user) return "/home";
        if (store.requiresVerification()) return "/verify-account";
        if (store.isAuthenticated()) {
          const userType = store.getUserType();
          if (userType === "landlord") return "/landlord-dashboard";
          if (userType === "admin") return "/admin-dashboard";
          if (userType === "rentor") return "/dashboard";
          return "/dashboard";
        }
        //Todo => If user exists but not authenticated (inactive), redirect to login
        return "/login";
      },
    }),
    {
      name: "quick_rent_auth_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        registrationData: state.registrationData,
      }),
    }
  )
);

export default useAuthStore;

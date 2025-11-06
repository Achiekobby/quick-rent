import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Minus,
  Upload,
  X,
  AlertCircle,
  DollarSign,
  Phone,
  MessageCircle,
  Image as ImageIcon,
  Star,
  Copy,
  Eye,
  EyeOff,
  Code,
  Shield,
  CreditCard,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import {
  getPropertyById,
  updateProperty,
} from "../../api/Landlord/General/PropertyRequest";
import ghanaRegions from "../../data/ghanaRegions";
import { Loader2 } from "lucide-react";
import { propertyTypes, amenitiesList } from "../../data/PropertyTypes";
import useAuthStore from "../../stores/authStore";
import moment from "moment";

// Helper function to check subscription status
const checkSubscriptionStatus = (subscriptionPlan) => {
  if (!subscriptionPlan || !subscriptionPlan.end_date) {
    return { hasSubscription: false, isExpired: true, message: "No active subscription" };
  }
  
  const endDate = moment(subscriptionPlan.end_date);
  const now = moment();
  const isExpired = endDate.isBefore(now);
  const daysLeft = Math.max(0, endDate.diff(now, "days"));
  
  return {
    hasSubscription: true,
    isExpired,
    daysLeft,
    endDate: subscriptionPlan.end_date,
    planName: subscriptionPlan.plan_name,
    message: isExpired ? "Subscription has expired" : null,
  };
};

const EditProperty = () => {
  const { propertySlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [formData, setFormData] = useState(null);
  const [, setProperty] = useState(null);

  // Refs for error fields to enable smooth scrolling
  const errorFieldRefs = useRef({});

  // Helper function to scroll to first error field
  const scrollToFirstError = (newErrors) => {
    const firstErrorField = Object.keys(newErrors)[0];
    if (firstErrorField && errorFieldRefs.current[firstErrorField]) {
      const element = errorFieldRefs.current[firstErrorField];
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const offset = 120; // Offset from top for better visibility

      window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: "smooth",
      });

      // Add a subtle shake animation to draw attention
      element.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        element.style.animation = "";
      }, 500);
    }
  };

  //Todo => Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Add shake animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  //Todo => Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const response = await getPropertyById(propertySlug);
        console.log("Response", response);
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          const propertyData = response?.data?.data;

          // Transform the data to match the form structure
          const transformedData = (() => {
            // Handle custom location logic - check if location is in predefined list
            const region = propertyData.region;
            const location = propertyData.location;
            const isCustomLocation =
              region && location && !ghanaRegions[region]?.includes(location);

            return {
              ...propertyData,
              // Set location dropdown and custom location field based on whether it's a custom location
              location: isCustomLocation ? "Other" : location,
              customLocation: isCustomLocation ? location : "",
              // Strip country code from phone numbers
              contact_number: stripCountryCode(propertyData.contact_number),
              whatsapp_number: stripCountryCode(propertyData.whatsapp_number),
              property_images: (() => {
                const allImages = [];

                if (propertyData.images && propertyData.images.length > 0) {
                  propertyData.images.forEach((img) => {
                    allImages.push({
                      image: img.url,
                      slug: img.slug,
                      is_featured: false,
                      isNew: false,
                    });
                  });
                }

                if (propertyData.featured_image) {
                  const featuredImageSlug = propertyData.featured_image.slug;
                  const existingImageIndex = allImages.findIndex((img) => {
                    return img.slug === featuredImageSlug;
                  });

                  if (existingImageIndex >= 0) {
                    allImages[existingImageIndex].is_featured = true;
                  } else {
                    allImages.unshift({
                      image: propertyData.featured_image.url,
                      slug: propertyData.featured_image.slug,
                      is_featured: true,
                      isNew: false,
                    });
                  }
                }
                return allImages;
              })(),
              amenities: propertyData.amenities || [],
              district: propertyData.district || "",
              landmark: propertyData.landmark || "",
              bathroom_type: propertyData.bathroom_type || "private",
              kitchen_type: propertyData.kitchen_type || "private",
              square_feet: propertyData.square_feet ? String(propertyData.square_feet) : "",
            };
          })();

          setFormData(transformedData);
          setProperty(transformedData);
        } else {
          toast.error(
            response?.data?.reason ||
              "Failed to fetch property. Please try again."
          );
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.reason ||
            "An error occurred while fetching the property. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertySlug]);

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      description: "Property details and location",
    },
    {
      id: 2,
      title: "Property Specifications",
      description: "Rooms, amenities, and features",
    },
    {
      id: 3,
      title: "Pricing & Contact",
      description: "Rent details and contact info",
    },
    {
      id: 4,
      title: "Images & Review",
      description: "Property photos and final review",
    },
  ];

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 9 && /^\d{9}$/.test(cleanPhone);
  };

  // Helper function to strip 233 prefix from phone numbers
  const stripCountryCode = (phoneNumber) => {
    if (!phoneNumber) return "";
    const cleanPhone = phoneNumber.toString().replace(/\D/g, "");
    // If it starts with 233 and has more than 9 digits, remove the 233
    if (cleanPhone.startsWith("233") && cleanPhone.length > 9) {
      return cleanPhone.substring(3);
    }
    return cleanPhone;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (field, value) => {
    let cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 9) {
      cleanValue = cleanValue.slice(0, 9);
    }
    handleInputChange(field, cleanValue);
  };

  const handleAmenityToggle = (amenityName) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.some((a) =>
        typeof a === "string" ? a === amenityName : a.name === amenityName
      )
        ? prev.amenities.filter((a) =>
            typeof a === "string" ? a !== amenityName : a.name !== amenityName
          )
        : [...prev.amenities, amenityName],
    }));
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const isImageUrl = (imageString) => {
    return (
      imageString.startsWith("http://") || imageString.startsWith("https://")
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const currentImagesCount = (formData.property_images || []).length;
    const totalImages = currentImagesCount + files.length;

    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const base64Images = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await convertToBase64(file);
          return {
            image: base64,
            is_featured: false,
            isNew: true,
          };
        })
      );

      const newPreviewUrls = validFiles.map((file) =>
        URL.createObjectURL(file)
      );

      setImageFiles((prev) => [...prev, ...validFiles]);
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      setFormData((prev) => {
        const currentImages = prev.property_images || [];
        const updatedImages = [...currentImages, ...base64Images];

        // If no image is currently featured, make the first image featured
        const hasFeaturedImage = updatedImages.some((img) => img.is_featured);
        if (!hasFeaturedImage && updatedImages.length > 0) {
          updatedImages[0].is_featured = true;
        }

        return {
          ...prev,
          property_images: updatedImages,
        };
      });

      toast.success(`${validFiles.length} image(s) uploaded successfully`);
    } catch {
      toast.error("Failed to process images. Please try again.");
    }
  };

  const removeImage = (index) => {
    const propertyImages = formData.property_images || [];
    const imageToRemove = propertyImages[index];
    const wasFeatureImage = imageToRemove?.is_featured;

    // Only revoke URL if it's a newly uploaded image (has preview URL)
    if (imagePreviewUrls[index] && imageToRemove?.isNew) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }

    setFormData((prev) => {
      const currentImages = prev.property_images || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);

      // If we removed the featured image and there are other images, make the first one featured
      if (wasFeatureImage && updatedImages.length > 0) {
        updatedImages[0].is_featured = true;
      }

      return {
        ...prev,
        property_images: updatedImages,
      };
    });

    toast.success("Image removed successfully");
  };

  const setFeaturedImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      property_images: (prev.property_images || []).map((img, i) => ({
        ...img,
        is_featured: i === index,
      })),
    }));
    toast.success("Featured image updated");
  };

  const getFeaturedImageIndex = () => {
    return (formData.property_images || []).findIndex((img) => img.is_featured);
  };

  const getImageDisplayUrl = (imageObj, index) => {
    if (isImageUrl(imageObj.image)) {
      return imageObj.image; // Existing image URL
    } else {
      // For base64 images, we need to create blob URLs for preview
      return imagePreviewUrls[index] || imageObj.image;
    }
  };

  // Generate complete API payload for preview
  const generateCompletePayload = (forPreview = false) => {
    const payload = {
      // System fields
      property_slug: propertySlug,

      // Basic Information
      title: formData.title,
      property_type: formData.property_type,

      // Location Details
      region: formData.region,
      location:
        formData.location === "Other"
          ? formData.customLocation
          : formData.location,
      suburb: formData.suburb,
      district: formData.district || null,
      landmark: formData.landmark || "",

      number_of_bedrooms: formData.number_of_rooms,
      number_of_bathrooms: formData.number_of_bathrooms || 0,
      bathroom_type: formData.bathroom_type,
      kitchen_type: formData.kitchen_type,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      square_feet: formData.square_feet ? String(formData.square_feet) : "",
      description: formData.description,
      amenities: formData.amenities.map((amenity) =>
        typeof amenity === "string" ? amenity : amenity.name
      ),

      // Pricing & Availability
      per_month_amount: parseFloat(formData.price) || 0,
      rental_years: formData.rental_years,
      negotiable: formData.is_negotiable,
      is_available: formData.is_available,

      // Contact Information
      contact_number: `233${formData.contact_number}`,
      whatsapp_number: `233${formData.whatsapp_number}`,

      // System Fields
      approval_status: formData.approval_status,

      // Property Images
      property_images:
        (formData.property_images || []).length > 0
          ? (formData.property_images || []).map((img, index) => {
              const hasFeaturedImage = (formData.property_images || []).some(
                (img) => img.is_featured
              );
              return {
                image:
                  forPreview && img.image.startsWith("data:")
                    ? `${img.image.substring(0, 50)}...`
                    : img.image,
                is_featured: hasFeaturedImage ? img.is_featured : index === 0,
              };
            })
          : [],

      // Metadata
      updated_at: new Date().toISOString(),
    };

    return payload;
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim())
          newErrors.title = "Property title is required";
        if (!formData.region) newErrors.region = "Region is required";
        if (!formData.location) newErrors.location = "Location is required";
        if (formData.location === "Other" && !formData.customLocation.trim()) {
          newErrors.customLocation = "Custom location is required";
        }
        if (!formData.suburb.trim()) newErrors.suburb = "Suburb is required";
        if (!formData.property_type)
          newErrors.property_type = "Property type is required";
        break;
      case 2: {
        if (
          !formData.year_built ||
          (typeof formData.year_built === "string" &&
            formData.year_built.trim() === "")
        )
          newErrors.year_built = "Year built is required";
        else if (parseInt(formData.year_built) > new Date().getFullYear())
          newErrors.year_built = "Year built cannot be in the future";
        const squareFeetStr = String(formData.square_feet || "").trim();
        if (!squareFeetStr) {
          newErrors.square_feet = "Square feet is required";
        }
        if (formData.amenities.length === 0)
          newErrors.amenities = "Please select at least one amenity";
        if (!formData.description.trim())
          newErrors.description = "Property description is required";
        break;
      }
      case 3:
        if (!formData.price || formData.price <= 0) {
          newErrors.price = "Valid monthly rent is required";
        }
        if (!formData.contact_number.trim())
          newErrors.contact_number = "Contact number is required";
        if (!formData.whatsapp_number.trim())
          newErrors.whatsapp_number = "WhatsApp number is required";
        break;
      case 4:
        if (
          !formData.property_images ||
          formData.property_images.length === 0
        ) {
          newErrors.property_images = "At least one property image is required";
        }
        break;
    }

    setErrors(newErrors);

    // Scroll to first error if validation fails
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => scrollToFirstError(newErrors), 100);
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const submissionData = generateCompletePayload(false);
      const response = await updateProperty(propertySlug, submissionData);
      console.log(response);
      if (response?.data?.status_code === "000" && !response?.data?.in_error) {
        toast.success("Property updated successfully!");
        navigate(`/view-property/${propertySlug}`);
      } else {
        toast.error(
          response?.data?.reason ||
            "Failed to update property. Please try again."
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if KYC is not approved
  const isKYCNotApproved = user?.kyc_verification !== true;

  // Check subscription status
  const subscriptionStatus = checkSubscriptionStatus(user?.subscription_plan);
  const isSubscriptionBlocked = !subscriptionStatus.hasSubscription || subscriptionStatus.isExpired;

  // Parse kyc_rejection_reason (stringified array)
  const parseRejectionReasons = (rejectionReason) => {
    if (!rejectionReason) return [];
    try {
      const parsed = JSON.parse(rejectionReason);
      return Array.isArray(parsed) ? parsed : [rejectionReason];
    } catch {
      // If parsing fails, treat as string and split by newlines or return as single item
      return typeof rejectionReason === "string" ? [rejectionReason] : [];
    }
  };

  const rejectionReasons = parseRejectionReasons(user?.kyc_rejection_reason);

  if (loading || !formData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-50 relative">
        {/* Subscription Blocking Modal */}
        {isSubscriptionBlocked && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {!subscriptionStatus.hasSubscription
                    ? "Subscription Required"
                    : "Subscription Expired"}
                </h2>
                {!subscriptionStatus.hasSubscription ? (
                  <p className="text-sm text-gray-600 mb-4">
                    You need to purchase a subscription plan to edit properties on the platform. Choose a plan that suits your needs.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Your subscription expired on{" "}
                      <span className="font-semibold text-gray-800">
                        {moment(subscriptionStatus.endDate).format("MMM DD, YYYY")}
                      </span>
                      . Renew your subscription to continue editing properties.
                    </p>
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-orange-800">
                        <span className="font-semibold">Plan:</span> {subscriptionStatus.planName?.charAt(0).toUpperCase() + subscriptionStatus.planName?.slice(1) || "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/subscription/upgrade")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {!subscriptionStatus.hasSubscription
                    ? "Purchase Subscription"
                    : "Renew Subscription"}
                </button>
                <button
                  onClick={() => navigate("/my-properties")}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Go to My Properties
                </button>
              </div>
            </Motion.div>
          </div>
        )}

        {/* KYC Verification Blocking Modal */}
        {isKYCNotApproved && !isSubscriptionBlocked && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  KYC Verification Required
                </h2>
                {rejectionReasons.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Your KYC verification has been rejected. Please review the reasons below and update your verification documents.
                    </p>
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4 text-left">
                      <p className="text-xs font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Rejection Reasons:
                      </p>
                      <ul className="space-y-2">
                        {rejectionReasons.map((reason, index) => (
                          <li
                            key={index}
                            className="text-sm text-red-800 flex items-start gap-2"
                          >
                            <span className="text-red-600 font-bold mt-0.5 flex-shrink-0">
                              {index + 1}.
                            </span>
                            <span className="break-words flex-1">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs text-gray-600">
                      You need to update your verification documents in your profile before you can edit properties.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">
                    Your KYC verification is currently pending review or has not been completed. You will be able to edit properties once your verification is approved.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {rejectionReasons.length > 0
                    ? "Update Verification Documents"
                    : "Complete Verification"}
                </button>
                <button
                  onClick={() => navigate("/my-properties")}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Go to My Properties
                </button>
              </div>
            </Motion.div>
          </div>
        )}

        <div className={`max-w-8xl mx-auto px-4 py-8 ${isKYCNotApproved || isSubscriptionBlocked ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/view-property/${propertySlug}`)}
              className="p-2 hover:bg-white rounded-lg border border-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          </div>

          {/* Admin Approval Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Admin Approval Required
                </h4>
                <p className="text-sm text-blue-700">
                  After editing property details, your changes will be submitted for admin review and approval before being published. You'll be notified once the review is complete.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep >= step.id
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-200 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={20} />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-medium ${
                        currentStep >= step.id
                          ? "text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <AnimatePresence mode="wait">
              {/* Step 1 - Basic Info */}
              {currentStep === 1 && (
                <Motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">Basic Information</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Title *
                    </label>
                    <input
                      ref={(el) => (errorFieldRefs.current.title = el)}
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                        errors.title
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type *
                    </label>
                    <div
                      ref={(el) => (errorFieldRefs.current.property_type = el)}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {propertyTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            handleInputChange("property_type", type)
                          }
                          className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                            formData.property_type === type
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {errors.property_type && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.property_type}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region *
                      </label>
                      <select
                        ref={(el) => (errorFieldRefs.current.region = el)}
                        value={formData.region}
                        onChange={(e) =>
                          handleInputChange("region", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                          errors.region
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <option value="">Select Region</option>
                        {Object.keys(ghanaRegions).map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      {errors.region && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.region}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <select
                        ref={(el) => (errorFieldRefs.current.location = el)}
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        disabled={!formData.region}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                          errors.location
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        } ${!formData.region ? "bg-gray-100" : ""}`}
                      >
                        <option value="">Select Location</option>
                        {formData.region &&
                          ghanaRegions[formData.region]?.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                      </select>
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Custom Location Input */}
                  <AnimatePresence>
                    {formData.location === "Other" && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specify Location *
                        </label>
                        <input
                          ref={(el) =>
                            (errorFieldRefs.current.customLocation = el)
                          }
                          type="text"
                          value={formData.customLocation}
                          onChange={(e) =>
                            handleInputChange("customLocation", e.target.value)
                          }
                          placeholder="Enter specific location"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                            errors.customLocation
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                        {errors.customLocation && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.customLocation}
                          </p>
                        )}
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  {/* Suburb and Additional Location Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suburb/Area *
                      </label>
                      <input
                        ref={(el) => (errorFieldRefs.current.suburb = el)}
                        type="text"
                        value={formData.suburb}
                        onChange={(e) =>
                          handleInputChange("suburb", e.target.value)
                        }
                        placeholder="e.g., American House"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                          errors.suburb
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />
                      {errors.suburb && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.suburb}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District{" "}
                        <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) =>
                          handleInputChange("district", e.target.value)
                        }
                        placeholder="e.g., Ayawaso West Municipal"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) =>
                        handleInputChange("landmark", e.target.value)
                      }
                      placeholder="e.g., Near East Legon Police Station"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </Motion.div>
              )}

              {/* Step 2 - Specifications */}
              {currentStep === 2 && (
                <Motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">
                    Property Specifications
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Bedrooms *
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange(
                              "number_of_rooms",
                              Math.max(0, formData.number_of_rooms - 1)
                            )
                          }
                          className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-xl font-semibold min-w-[2rem] text-center">
                          {formData.number_of_rooms}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange(
                              "number_of_rooms",
                              formData.number_of_rooms + 1
                            )
                          }
                          className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Bathrooms *
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange(
                              "number_of_bathrooms",
                              Math.max(0, formData.number_of_bathrooms - 1)
                            )
                          }
                          className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-xl font-semibold min-w-[2rem] text-center">
                          {formData.number_of_bathrooms}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange(
                              "number_of_bathrooms",
                              formData.number_of_bathrooms + 1
                            )
                          }
                          className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bathroom and Kitchen Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bathroom Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["private", "shared"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              handleInputChange("bathroom_type", type)
                            }
                            className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                              formData.bathroom_type === type
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kitchen Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["private", "shared"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              handleInputChange("kitchen_type", type)
                            }
                            className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                              formData.kitchen_type === type
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Year Built */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Built *
                    </label>
                    <input
                      ref={(el) => (errorFieldRefs.current.year_built = el)}
                      type="number"
                      value={formData.year_built}
                      onChange={(e) =>
                        handleInputChange("year_built", e.target.value)
                      }
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear()}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                        errors.year_built
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.year_built && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.year_built}
                      </p>
                    )}
                  </div>

                  {/* Square Feet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Square Feet *
                    </label>
                    <input
                      ref={(el) => (errorFieldRefs.current.square_feet = el)}
                      type="text"
                      value={formData.square_feet || ""}
                      onChange={(e) =>
                        handleInputChange("square_feet", e.target.value)
                      }
                      placeholder="e.g., 1200"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                        errors.square_feet
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.square_feet && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.square_feet}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Amenities *
                    </label>
                    <div
                      ref={(el) => (errorFieldRefs.current.amenities = el)}
                      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${
                        errors.amenities
                          ? "border border-red-500 rounded-xl p-3 bg-red-50"
                          : ""
                      }`}
                    >
                      {amenitiesList.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className={`p-3 border rounded-xl text-sm font-medium transition-all text-left ${
                            formData.amenities.some((a) =>
                              typeof a === "string"
                                ? a === amenity
                                : a.name === amenity
                            )
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                formData.amenities.some((a) =>
                                  typeof a === "string"
                                    ? a === amenity
                                    : a.name === amenity
                                )
                                  ? "border-orange-500 bg-orange-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {formData.amenities.some((a) =>
                                typeof a === "string"
                                  ? a === amenity
                                  : a.name === amenity
                              ) && <Check size={10} className="text-white" />}
                            </div>
                            <span>{amenity}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.amenities && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.amenities}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Description *
                    </label>
                    <textarea
                      ref={(el) => (errorFieldRefs.current.description = el)}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={5}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all ${
                        errors.description
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.description}
                      </p>
                    )}
                  </div>
                </Motion.div>
              )}

              {/* Step 3 - Pricing & Contact */}
              {currentStep === 3 && (
                <Motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">
                    Pricing & Contact Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Rent (GHS) *
                    </label>
                    <div className="relative">
                      <DollarSign
                        size={20}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        ref={(el) => (errorFieldRefs.current.price = el)}
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                          errors.price
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Rental Period (Years)
                      </label>
                      <select
                        value={formData.rental_years}
                        onChange={(e) =>
                          handleInputChange(
                            "rental_years",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      >
                        <option value={1}>1 Year</option>
                        <option value={2}>2 Years</option>
                        <option value={3}>3 Years</option>
                        <option value={4}>4 Years</option>
                        <option value={5}>5+ Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggles Section */}
                  <div className="space-y-4">
                    {/* Negotiable Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Price is negotiable
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Allow potential tenants to negotiate the rental price
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange(
                            "is_negotiable",
                            !formData.is_negotiable
                          )
                        }
                        className={`w-12 h-6 rounded-full transition-all ${
                          formData.is_negotiable
                            ? "bg-orange-500"
                            : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                            formData.is_negotiable
                              ? "translate-x-6"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Available Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Property is available for rent
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Toggle this off if the property is temporarily
                          unavailable
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange(
                            "is_available",
                            !formData.is_available
                          )
                        }
                        className={`w-12 h-6 rounded-full transition-all ${
                          formData.is_available ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                            formData.is_available
                              ? "translate-x-6"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <div className="flex">
                        <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-medium">
                          +233
                        </div>
                        <input
                          ref={(el) =>
                            (errorFieldRefs.current.contact_number = el)
                          }
                          type="text"
                          value={formData.contact_number}
                          onChange={(e) =>
                            handlePhoneChange("contact_number", e.target.value)
                          }
                          placeholder="244567890"
                          maxLength="9"
                          className={`flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                            errors.contact_number
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {formData.contact_number &&
                        !validatePhoneNumber(formData.contact_number) && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            Please enter exactly 9 digits after 233
                          </p>
                        )}
                      {errors.contact_number && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.contact_number}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number *
                      </label>
                      <div className="flex">
                        <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-medium">
                          +233
                        </div>
                        <input
                          ref={(el) =>
                            (errorFieldRefs.current.whatsapp_number = el)
                          }
                          type="text"
                          value={formData.whatsapp_number}
                          onChange={(e) =>
                            handlePhoneChange("whatsapp_number", e.target.value)
                          }
                          placeholder="244567890"
                          maxLength="9"
                          className={`flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                            errors.whatsapp_number
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {formData.whatsapp_number &&
                        !validatePhoneNumber(formData.whatsapp_number) && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            Please enter exactly 9 digits after 233
                          </p>
                        )}
                      {errors.whatsapp_number && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.whatsapp_number}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange(
                            "whatsapp_number",
                            formData.contact_number
                          )
                        }
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2"
                      >
                        Use same number as contact
                      </button>
                    </div>
                  </div>
                </Motion.div>
              )}

              {/* Step 4 - Images with Complete API Payload Preview */}
              {currentStep === 4 && (
                <Motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">Property Images</h2>

                  <div
                    ref={(el) => (errorFieldRefs.current.property_images = el)}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      errors.property_images
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImageIcon
                      size={48}
                      className="text-gray-400 mx-auto mb-4"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={(formData.property_images || []).length >= 5}
                      className={`px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors ${
                        (formData.property_images || []).length >= 5
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      <Upload size={20} />
                      {(formData.property_images || []).length > 0
                        ? "Add More Images"
                        : "Upload Images"}
                    </button>
                    <p className="text-gray-500 text-sm mt-2">
                      Drop images here or click to browse (Max 5MB each)
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Supported formats: JPG, PNG, WebP
                    </p>
                    {(formData.property_images || []).length > 0 && (
                      <p className="text-sm text-gray-600 mt-2 font-medium">
                        {(formData.property_images || []).length}/5 images
                      </p>
                    )}
                  </div>

                  {errors.property_images && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.property_images}
                    </p>
                  )}

                  {(formData.property_images || []).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Property Images
                        </h3>
                        <p className="text-sm text-gray-500">
                          Click the star to set featured image
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(formData.property_images || []).map(
                          (imageObj, index) => (
                            <Motion.div
                              key={`${imageObj.image}-${index}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                            >
                              <div className="aspect-video relative">
                                <img
                                  src={getImageDisplayUrl(imageObj, index)}
                                  alt={`Property ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Featured Badge */}
                                {imageObj.is_featured && (
                                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                                    <Star size={12} fill="currentColor" />
                                    Featured
                                  </div>
                                )}

                                {/* New Image Badge */}
                                {imageObj.isNew && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                                    New
                                  </div>
                                )}

                                {/* Image Controls */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setFeaturedImage(index)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                      imageObj.is_featured
                                        ? "bg-orange-500 text-white"
                                        : "bg-white text-gray-800 hover:bg-gray-100"
                                    }`}
                                  >
                                    <Star
                                      size={14}
                                      fill={
                                        imageObj.is_featured
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                    {imageObj.is_featured
                                      ? "Featured"
                                      : "Set Featured"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                                  >
                                    <X size={14} />
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {/* Image Info */}
                              <div className="p-3">
                                <p className="text-sm font-medium text-gray-900">
                                  Image {index + 1}
                                  {imageObj.is_featured && (
                                    <span className="ml-2 text-orange-600">
                                      • Featured
                                    </span>
                                  )}
                                  {imageObj.isNew && (
                                    <span className="ml-2 text-green-600">
                                      • New Upload
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {isImageUrl(imageObj.image)
                                    ? "Existing image"
                                    : "New upload"}
                                  {imageFiles[index]?.size &&
                                    ` • ${(
                                      imageFiles[index].size /
                                      1024 /
                                      1024
                                    ).toFixed(2)} MB`}
                                </p>
                              </div>
                            </Motion.div>
                          )
                        )}
                      </div>

                      {/* Featured Image Info */}
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Star
                            size={20}
                            className="text-orange-600 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-orange-900">
                              Featured Image
                            </h4>
                            <p className="text-sm text-orange-700 mt-1">
                              {getFeaturedImageIndex() >= 0
                                ? `Image ${
                                    getFeaturedImageIndex() + 1
                                  } is set as featured and will be displayed on property cards.`
                                : "The first image will be used as featured image by default."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Review Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">
                          Ready to Submit Changes?
                        </h4>
                        <p className="text-sm text-amber-700">
                          Your edited property details will be sent for admin approval. The property will remain in its current state until your changes are reviewed and approved by an administrator.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Complete API Payload Preview */}
                  {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Code size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">
                            Complete API Payload
                          </h4>
                          <p className="text-sm text-blue-700">
                            Ready to send to your backend for UPDATE
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowFullPayload(!showFullPayload)}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          {showFullPayload ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                          {showFullPayload ? "Collapse" : "Expand"}
                        </button>
                        <button
                          type="button"
                          onClick={copyPayloadToClipboard}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Copy size={14} />
                          Copy JSON
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {Object.keys(generateCompletePayload(false)).length}
                        </p>
                        <p className="text-xs text-blue-700">Total Fields</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {(formData.property_images || []).length}
                        </p>
                        <p className="text-xs text-green-700">Images</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {(formData.amenities || []).length}
                        </p>
                        <p className="text-xs text-orange-700">Amenities</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {
                            JSON.stringify(generateCompletePayload(false))
                              .length
                          }
                        </p>
                        <p className="text-xs text-purple-700">Bytes</p>
                      </div>
                    </div>

                    <div
                      className={`transition-all duration-300 ${
                        showFullPayload ? "max-h-96" : "max-h-40"
                      } overflow-y-auto`}
                    >
                      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                        <pre className="text-green-400 whitespace-pre-wrap break-all">
                          {JSON.stringify(
                            generateCompletePayload(true),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-white/60 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">
                        🔄 Backend Update Integration Guide
                      </h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          • <strong>Endpoint:</strong> PUT /api/properties/
                          {propertySlug}
                        </p>
                        <p>
                          • <strong>Content-Type:</strong> application/json
                        </p>
                        <p>
                          • <strong>Mixed Images:</strong> URLs (existing) +
                          Base64 (new uploads)
                        </p>
                        <p>
                          • <strong>New Image Flag:</strong> isNew: true for
                          newly uploaded images
                        </p>
                        <p>
                          • <strong>Featured Image:</strong> Only one image has
                          is_featured: true
                        </p>
                        <p>
                          • <strong>Response:</strong> Return updated property
                          with new image URLs
                        </p>
                        <p>
                          • <strong>Processing:</strong> Decode base64 for new
                          images, keep URLs for existing
                        </p>
                      </div>
                    </div>
                  </div> */}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 border rounded-xl font-semibold ${
                currentStep === 1
                  ? "border-gray-200 text-gray-400"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowLeft size={20} className="inline mr-2" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Next
                <ArrowRight size={20} className="inline ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Update Property
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EditProperty;

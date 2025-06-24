import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Calendar,
  Phone,
  MessageCircle,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Home,
  Star,
  Copy,
  Eye,
  EyeOff,
  Code,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import { createProperty } from "../../api/Landlord/General/PropertyRequest";

const AddProperty = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Ghana regions and their major locations
  const ghanaRegions = {
    "Greater Accra": [
      "Accra",
      "Tema",
      "Kasoa",
      "East Legon",
      "Airport Residential",
      "Dansoman",
      "Adenta",
      "Madina",
      "Spintex",
      "Cantonments",
      "Other",
    ],
    Ashanti: [
      "Kumasi",
      "Obuasi",
      "Ejisu",
      "Konongo",
      "Mampong",
      "Bekwai",
      "Other",
    ],
    Western: ["Takoradi", "Axim", "Half Assini", "Prestea", "Tarkwa", "Other"],
    Central: ["Cape Coast", "Elmina", "Winneba", "Kasoa", "Swedru", "Other"],
    Eastern: ["Koforidua", "Akosombo", "Nkawkaw", "Begoro", "Other"],
    Northern: ["Tamale", "Yendi", "Salaga", "Other"],
    "Upper East": ["Bolgatanga", "Navrongo", "Bawku", "Other"],
    "Upper West": ["Wa", "Lawra", "Jirapa", "Other"],
    Volta: ["Ho", "Keta", "Hohoe", "Kpando", "Other"],
    "Brong Ahafo": [
      "Sunyani",
      "Techiman",
      "Berekum",
      "Dormaa Ahenkro",
      "Other",
    ],
  };

  const propertyTypes = [
    "Single Room",
    "Chamber and Hall",
    "2 Bedroom Apartment",
    "3 Bedroom Apartment",
    "Office Space",
    "Short Stay",
  ];

  const amenitiesList = [
    "Air Conditioning",
    "Parking",
    "Swimming Pool",
    "Gym",
    "Security",
    "Elevator",
    "Balcony",
    "Garden",
    "WiFi",
    "Furnished",
    "Pet Friendly",
    "Laundry",
    "Storage",
    "Fire Safety",
    "CCTV",
    "Generator",
    "Water Tank",
    "Solar Power",
    "Intercom",
    "Gated Community",
  ];

  const [formData, setFormData] = useState({
    title: "",
    region: "",
    location: "",
    customLocation: "",
    suburb: "",
    district: "",
    landmark: "",
    per_month_amount: "",
    rental_years: 1,
    negotiable: false,
    number_of_bedrooms: 1,
    number_of_bathrooms: 1,
    bathroom_type: "private",
    kitchen_type: "private",
    description: "",
    contact_number: "",
    whatsapp_number: "",
    year_built: "",
    amenities: [],
    approval_status: "unverified",
    property_type: "",
    property_images: [],
    is_available: true,
  });

  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [showFullPayload, setShowFullPayload] = useState(false);

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const totalImages = formData.property_images.length + files.length;

    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file types and sizes
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
            is_featured: false, // Will be set later if needed
          };
        })
      );

      // Create preview URLs for display
      const newPreviewUrls = validFiles.map((file) =>
        URL.createObjectURL(file)
      );

      setImageFiles((prev) => [...prev, ...validFiles]);
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      setFormData((prev) => {
        const updatedImages = [...prev.property_images, ...base64Images];

        // If this is the first image and no image is featured, make it featured
        if (prev.property_images.length === 0 && updatedImages.length > 0) {
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
    // Revoke the object URL to prevent memory leaks
    if (imagePreviewUrls[index]) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }

    const wasFeatureImage = formData.property_images[index]?.is_featured;

    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));

    setFormData((prev) => {
      const updatedImages = prev.property_images.filter((_, i) => i !== index);

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
      property_images: prev.property_images.map((img, i) => ({
        ...img,
        is_featured: i === index,
      })),
    }));
    toast.success("Featured image updated");
  };

  const getFeaturedImageIndex = () => {
    return formData.property_images.findIndex((img) => img.is_featured);
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
      case 2:
        if (formData.number_of_bedrooms < 0)
          newErrors.number_of_bedrooms = "Invalid number of bedrooms";
        if (formData.number_of_bathrooms < 0)
          newErrors.number_of_bathrooms = "Invalid number of bathrooms";
        if (!formData.year_built || formData.year_built.trim() === "")
          newErrors.year_built = "Year built is required";
        else if (parseInt(formData.year_built) > new Date().getFullYear())
          newErrors.year_built = "Year built cannot be in the future";
        if (formData.amenities.length === 0)
          newErrors.amenities = "Please select at least one amenity";
        if (!formData.description.trim())
          newErrors.description = "Property description is required";
        break;
      case 3:
        if (!formData.per_month_amount || formData.per_month_amount <= 0) {
          newErrors.per_month_amount = "Valid monthly rent is required";
        }
        if (!formData.contact_number.trim())
          newErrors.contact_number = "Contact number is required";
        if (!formData.whatsapp_number.trim())
          newErrors.whatsapp_number = "WhatsApp number is required";
        break;
      case 4:
        if (formData.property_images.length === 0) {
          newErrors.property_images = "At least one property image is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const submissionData = {
        ...formData,
        property_images:
          formData.property_images.length > 0
            ? formData.property_images.map((img, index) => {
                const hasFeaturedImage = formData.property_images.some(
                  (img) => img.is_featured
                );
                return {
                  image: img.image,
                  is_featured: hasFeaturedImage ? img.is_featured : index === 0,
                };
              })
            : [],
      };

      const response = await createProperty(submissionData);
      if (response?.data?.status_code === "001" && !response?.data?.in_error) {
        toast.success(
          "Property created successfully! It will be reviewed and published soon."
        );
        navigate("/my-properties");
      } else {
        toast.error(
          response?.data?.reason ||
            "Failed to create property. Please try again."
        );
      }
    } catch (error) {
      toast.error("Failed to create property. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 9 && /^\d{9}$/.test(cleanPhone);
  };

  const handlePhoneChange = (field, value) => {
    let cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 9) {
      cleanValue = cleanValue.slice(0, 9);
    }
    handleInputChange(field, cleanValue);
  };

  // Generate complete API payload for preview
  const generateCompletePayload = (forPreview = false) => {
    const payload = {
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
      landmark: formData.landmark || null,

      // Property Specifications
      number_of_bedrooms: formData.number_of_bedrooms,
      number_of_bathrooms: formData.number_of_bathrooms,
      bathroom_type: formData.bathroom_type,
      kitchen_type: formData.kitchen_type,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      description: formData.description,
      amenities: formData.amenities,

      // Pricing & Availability
      per_month_amount: parseFloat(formData.per_month_amount) || 0,
      rental_years: formData.rental_years,
      negotiable: formData.negotiable,
      is_available: formData.is_available,

      // Contact Information
      contact_number: `+233${formData.contact_number}`,
      whatsapp_number: `+233${formData.whatsapp_number}`,

      // System Fields
      approval_status: formData.approval_status,

      // Property Images
      property_images:
        formData.property_images.length > 0
          ? formData.property_images.map((img, index) => {
              const hasFeaturedImage = formData.property_images.some(
                (img) => img.is_featured
              );
              return {
                image:
                  forPreview && img.image.startsWith("data:")
                    ? `${img.image.substring(0, 20)}...`
                    : img.image, // Truncate base64 for preview, keep full for actual submission
                is_featured: hasFeaturedImage ? img.is_featured : index === 0,
              };
            })
          : [],

      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return payload;
  };

  // Copy payload to clipboard
  const copyPayloadToClipboard = async () => {
    try {
      const payload = generateCompletePayload(true); // Use truncated version for copy too
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success("API payload copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Property Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Modern 3-Bedroom Apartment in East Legon"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                  errors.title ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange("property_type", type)}
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

            {/* Location Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => {
                    handleInputChange("region", e.target.value);
                    handleInputChange("location", ""); // Reset location when region changes
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                    errors.region ? "border-red-500" : "border-gray-200"
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

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  disabled={!formData.region}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                    errors.location ? "border-red-500" : "border-gray-200"
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
                    type="text"
                    value={formData.customLocation}
                    onChange={(e) =>
                      handleInputChange("customLocation", e.target.value)
                    }
                    placeholder="Enter specific location"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                      errors.customLocation
                        ? "border-red-500"
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
                  type="text"
                  value={formData.suburb}
                  onChange={(e) => handleInputChange("suburb", e.target.value)}
                  placeholder="e.g., American House"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                    errors.suburb ? "border-red-500" : "border-gray-200"
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
                  District <span className="text-gray-400">(Optional)</span>
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
                onChange={(e) => handleInputChange("landmark", e.target.value)}
                placeholder="e.g., Near East Legon Police Station"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </Motion.div>
        );

      case 2:
        return (
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Bedrooms and Bathrooms */}
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
                        "number_of_bedrooms",
                        Math.max(0, formData.number_of_bedrooms - 1)
                      )
                    }
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-semibold min-w-[2rem] text-center">
                    {formData.number_of_bedrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange(
                        "number_of_bedrooms",
                        formData.number_of_bedrooms + 1
                      )
                    }
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {errors.number_of_bedrooms && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.number_of_bedrooms}
                  </p>
                )}
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
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
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
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {errors.number_of_bathrooms && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.number_of_bathrooms}
                  </p>
                )}
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
                      onClick={() => handleInputChange("bathroom_type", type)}
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
                      onClick={() => handleInputChange("kitchen_type", type)}
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
                type="number"
                value={formData.year_built}
                onChange={(e) =>
                  handleInputChange("year_built", e.target.value)
                }
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear()}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                  errors.year_built ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.year_built && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.year_built}
                </p>
              )}
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities *
              </label>
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${
                errors.amenities ? "border border-red-500 rounded-xl p-3 bg-red-50" : ""
              }`}>
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-3 border rounded-xl text-sm font-medium transition-all text-left ${
                      formData.amenities.includes(amenity)
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.amenities.includes(amenity)
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.amenities.includes(amenity) && (
                          <Check size={10} className="text-white" />
                        )}
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your property in detail. Include what makes it special, nearby amenities, transportation links, etc."
                rows={5}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none ${
                  errors.description ? "border-red-500" : "border-gray-200"
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.description}
                  </p>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                  {formData.description.length} characters
                </span>
              </div>
            </div>
          </Motion.div>
        );

      case 3:
        return (
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Rental Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    type="number"
                    value={formData.per_month_amount}
                    onChange={(e) =>
                      handleInputChange("per_month_amount", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                      errors.per_month_amount
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.per_month_amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.per_month_amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rental Period (Years)
                </label>
                <select
                  value={formData.rental_years}
                  onChange={(e) =>
                    handleInputChange("rental_years", parseInt(e.target.value))
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
                    handleInputChange("negotiable", !formData.negotiable)
                  }
                  className={`w-12 h-6 rounded-full transition-all ${
                    formData.negotiable ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      formData.negotiable ? "translate-x-6" : "translate-x-0.5"
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
                    Toggle this off if the property is temporarily unavailable
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("is_available", !formData.is_available)
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

            {/* Contact Information */}
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
                    type="text"
                    value={formData.contact_number}
                    onChange={(e) =>
                      handlePhoneChange("contact_number", e.target.value)
                    }
                    placeholder="244567890"
                    maxLength="9"
                    className={`flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                      errors.contact_number
                        ? "border-red-500"
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
                    type="text"
                    value={formData.whatsapp_number}
                    onChange={(e) =>
                      handlePhoneChange("whatsapp_number", e.target.value)
                    }
                    placeholder="244567890"
                    maxLength="9"
                    className={`flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                      errors.whatsapp_number
                        ? "border-red-500"
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
              </div>
            </div>

            {/* Copy Contact to WhatsApp */}
            <button
              type="button"
              onClick={() =>
                handleInputChange("whatsapp_number", formData.contact_number)
              }
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              Use same number for WhatsApp
            </button>
          </Motion.div>
        );

      case 4:
        return (
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Images *{" "}
                <span className="text-gray-400">(Maximum 5 images)</span>
              </label>

              {/* Upload Button */}
              <div
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
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formData.property_images.length >= 5}
                  className={`px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors ${
                    formData.property_images.length >= 5
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  <Upload size={20} />
                  Upload Images
                </button>
                <p className="text-gray-500 text-sm mt-2">
                  Drop images here or click to browse (Max 5MB each)
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Supported formats: JPG, PNG, WebP
                </p>
                {formData.property_images.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    {formData.property_images.length}/5 images uploaded
                  </p>
                )}
              </div>

              {errors.property_images && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.property_images}
                </p>
              )}

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Property Images
                    </h3>
                    <p className="text-sm text-gray-500">
                      Click the star to set featured image
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <Motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-video relative">
                          <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Featured Badge */}
                          {formData.property_images[index]?.is_featured && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                              <Star size={12} fill="currentColor" />
                              Featured
                            </div>
                          )}

                          {/* Image Controls */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFeaturedImage(index)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                formData.property_images[index]?.is_featured
                                  ? "bg-orange-500 text-white"
                                  : "bg-white text-gray-800 hover:bg-gray-100"
                              }`}
                            >
                              <Star
                                size={14}
                                fill={
                                  formData.property_images[index]?.is_featured
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                              {formData.property_images[index]?.is_featured
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
                            {formData.property_images[index]?.is_featured && (
                              <span className="ml-2 text-orange-600">
                                • Featured
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {imageFiles[index]?.size
                              ? `${(
                                  imageFiles[index].size /
                                  1024 /
                                  1024
                                ).toFixed(2)} MB`
                              : ""}
                          </p>
                        </div>
                      </Motion.div>
                    ))}
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
                      Ready to send to your backend
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFullPayload(!showFullPayload)}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    {showFullPayload ? <EyeOff size={14} /> : <Eye size={14} />}
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
                    {formData.property_images.length}
                  </p>
                  <p className="text-xs text-green-700">Images</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {formData.amenities.length}
                  </p>
                  <p className="text-xs text-orange-700">Amenities</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {JSON.stringify(generateCompletePayload(false)).length}
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
                    {JSON.stringify(generateCompletePayload(true), null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white/60 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">
                  📡 Backend Integration Guide
                </h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    • <strong>Endpoint:</strong> POST /api/properties
                  </p>
                  <p>
                    • <strong>Content-Type:</strong> application/json
                  </p>
                  <p>
                    • <strong>Images:</strong> Base64 strings (decode & store as
                    files)
                  </p>
                  <p>
                    • <strong>Phone Numbers:</strong> Include +233 country code
                  </p>
                  <p>
                    • <strong>Featured Image:</strong> Only one image has
                    is_featured: true
                  </p>
                  <p>
                    • <strong>Response:</strong> Return property ID and decoded
                    image URLs
                  </p>
                </div>
              </div>
            </div> */}
          </Motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Property
                </h1>
                <p className="text-gray-600 mt-1">
                  Create a detailed listing for your property
                </p>
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
                      <p className="text-xs text-gray-400 hidden sm:block">
                        {step.description}
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
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 border rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowLeft size={20} className="inline mr-2" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Next
                <ArrowRight size={20} className="inline ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Create Property
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

export default AddProperty;

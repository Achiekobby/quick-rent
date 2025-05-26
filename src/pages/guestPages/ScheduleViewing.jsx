import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion as Motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Check, User, Phone, Mail, MessageSquare, Info } from 'lucide-react';
import GuestLayout from '../../Layouts/GuestLayout';
import Colors from '../../utils/Colors';

const ScheduleViewing = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (0 is Sunday)
      if (date.getDay() !== 0) {
        dates.push({
          date: date,
          formattedDate: date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })
        });
      }
    }
    setAvailableDates(dates);

    // Simulate API fetch
    setTimeout(() => {
      setProperty({
        id: propertyId,
        title: "Modern 3 Bedroom Apartment with Balcony",
        location: "East Legon, Accra",
        price: 2500,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1470&auto=format&fit=crop",
        landlord: {
          name: "Thomas Mensah",
          phone: "+233 50 123 4567",
          responseRate: "95%"
        }
      });
      setLoading(false);
    }, 1000);
  }, [propertyId]);

  // Generate time slots based on selected date
  useEffect(() => {
    if (selectedDate) {
      // Generate time slots from 9 AM to 6 PM
      const slots = [];
      const selectedDateObj = new Date(selectedDate.date);
      const dayOfWeek = selectedDateObj.getDay();
      
      // Start at 9 AM, end at 5 PM (last slot at 4 PM)
      const startHour = 9;
      // End earlier on Saturdays
      const endHour = dayOfWeek === 6 ? 14 : 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        // Skip lunch hour
        if (hour !== 13) {
          slots.push({
            time: `${hour}:00`,
            formattedTime: `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
            available: Math.random() > 0.3 // Randomly make some slots unavailable
          });
        }
      }
      
      setAvailableTimeSlots(slots);
      setSelectedTimeSlot(null); // Reset time slot when date changes
    }
  }, [selectedDate]);

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTimeSlot(time);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!selectedDate) {
      newErrors.date = 'Please select a date';
    }
    
    if (!selectedTimeSlot) {
      newErrors.time = 'Please select a time slot';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Motion.button 
          onClick={handleGoBack}
          className="flex items-center text-neutral-600 hover:text-primary-600 transition-colors mb-6"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Back to Property</span>
        </Motion.button>
        
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
            Schedule a Viewing
          </h1>
          <p className="text-neutral-600">
            Select your preferred date and time to view this property
          </p>
        </div>
        
        {isSubmitted ? (
          // Success message
          <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Viewing Request Sent!</h2>
            <p className="text-neutral-600 mb-6">
              Your request to view <span className="font-medium">{property.title}</span> on {selectedDate.formattedDate} at {selectedTimeSlot.formattedTime} has been sent successfully. The property owner will contact you soon to confirm the appointment.
            </p>
            <div className="space-y-3">
              <Motion.button
                onClick={() => navigate(`/properties/${propertyId}`)}
                className="w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-300"
                style={{ backgroundColor: Colors.accent.orange, color: 'white' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Return to Property
              </Motion.button>
              <Motion.button
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-4 bg-white border-2 rounded-xl font-medium transition-all duration-300"
                style={{ borderColor: Colors.neutral[200], color: Colors.neutral[700] }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Home
              </Motion.button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Scheduling Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
                {/* Date Selection */}
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Select a Date
                  </h3>
                  
                  {errors.date && (
                    <p className="text-red-500 text-sm mb-2">{errors.date}</p>
                  )}
                  
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {availableDates.map((date, index) => (
                      <Motion.button
                        key={index}
                        type="button"
                        className={`flex-shrink-0 px-3 py-2.5 rounded-lg flex flex-col items-center min-w-[80px] border ${
                          selectedDate === date 
                            ? 'border-2' 
                            : 'border'
                        }`}
                        style={{
                          borderColor: selectedDate === date ? Colors.accent.orange : Colors.neutral[200],
                          backgroundColor: selectedDate === date ? `${Colors.accent.orange}10` : 'white'
                        }}
                        onClick={() => handleDateSelect(date)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="text-sm font-medium">{date.formattedDate.split(' ')[0]}</span>
                        <span className="text-lg font-bold">{date.formattedDate.split(' ')[1]}</span>
                        <span className="text-xs">{date.formattedDate.split(' ')[2]}</span>
                      </Motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Time Slot Selection */}
                {selectedDate && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-neutral-900 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Select a Time Slot
                    </h3>
                    
                    {errors.time && (
                      <p className="text-red-500 text-sm mb-2">{errors.time}</p>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableTimeSlots.map((slot, index) => (
                        <Motion.button
                          key={index}
                          type="button"
                          disabled={!slot.available}
                          className={`px-3 py-2 rounded-lg text-center ${
                            !slot.available 
                              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                              : selectedTimeSlot === slot
                                ? 'border-2'
                                : 'border hover:border-primary-300'
                          }`}
                          style={{
                            borderColor: selectedTimeSlot === slot ? Colors.accent.orange : Colors.neutral[200],
                            backgroundColor: selectedTimeSlot === slot ? `${Colors.accent.orange}10` : 'white'
                          }}
                          onClick={() => slot.available && handleTimeSelect(slot)}
                          whileHover={slot.available ? { scale: 1.02 } : {}}
                          whileTap={slot.available ? { scale: 0.98 } : {}}
                        >
                          {slot.formattedTime}
                          {!slot.available && (
                            <span className="block text-xs">Unavailable</span>
                          )}
                        </Motion.button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Your Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.name ? 'border-red-500' : 'border-neutral-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.email ? 'border-red-500' : 'border-neutral-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.phone ? 'border-red-500' : 'border-neutral-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
                        Message (Optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="3"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Any specific questions or requests?"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <Motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70"
                  style={{ backgroundColor: Colors.accent.orange, color: 'white' }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Schedule Viewing
                    </>
                  )}
                </Motion.button>
              </form>
            </div>
            
            {/* Right Column - Property Summary */}
            <div className="space-y-6">
              {/* Property Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">{property.title}</h3>
                  
                  <div className="flex items-center text-neutral-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  
                  <div className="border-t border-neutral-100 pt-3">
                    <p className="text-neutral-900 font-bold">
                      ₵{property.price.toLocaleString()}
                      <span className="text-sm font-normal text-neutral-500 ml-1">/month</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* What to Expect */}
              <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  What to Expect
                </h3>
                
                <ul className="space-y-3 text-sm">
                  <li className="flex">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>You'll receive a confirmation email once your request is approved</span>
                  </li>
                  <li className="flex">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>The property owner typically responds within {property.landlord.responseRate} of the time</span>
                  </li>
                  <li className="flex">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Bring your ID for verification during the viewing</span>
                  </li>
                  <li className="flex">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Feel free to ask questions and inspect the property thoroughly</span>
                  </li>
                </ul>
              </div>
              
              {/* Contact Help */}
              <div className="bg-primary-50 rounded-xl p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Need Help?</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  If you have any questions about scheduling a viewing, our support team is here to help.
                </p>
                <div className="flex items-center gap-3">
                  <Motion.button
                    className="flex-1 py-2 rounded-lg bg-white border border-neutral-200 flex items-center justify-center gap-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">Call</span>
                  </Motion.button>
                  <Motion.button
                    className="flex-1 py-2 rounded-lg bg-white border border-neutral-200 flex items-center justify-center gap-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Chat</span>
                  </Motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuestLayout>
  );
};

export default ScheduleViewing; 
/**
 * Mock Reviews Data for Testing
 * 
 * This file contains sample review data that can be used to test
 * the reviews UI before the backend API is ready.
 * 
 * Usage:
 * Import this data in PropertyDetails.jsx and set it to the reviews state:
 * 
 * import { mockReviews } from "../../utils/mockReviewsData";
 * setReviews(mockReviews);
 */

export const mockReviews = [
  {
    id: 1,
    reviewer_name: "Kwame Mensah",
    reviewer_avatar: null,
    rating: 5,
    comment: "Excellent landlord! Very responsive and the property is exactly as described. The location is perfect and all amenities work great. Highly recommend!",
    created_at: "2024-11-15T10:30:00Z",
  },
  {
    id: 2,
    reviewer_name: "Ama Darko",
    reviewer_avatar: null,
    rating: 4,
    comment: "Good property overall. The landlord was helpful during move-in. Only minor issue was a leaky faucet that took a few days to fix, but everything else has been great.",
    created_at: "2024-11-10T14:20:00Z",
  },
  {
    id: 3,
    reviewer_name: "John Appiah",
    reviewer_avatar: null,
    rating: 5,
    comment: "Best rental experience I've had in Accra! The landlord is professional, maintenance requests are handled quickly, and the property is well-maintained. Clean and safe neighborhood too.",
    created_at: "2024-11-05T09:15:00Z",
 18
  },
  {
    id: 4,
    reviewer_name: "Sarah Osei",
    reviewer_avatar: null,
    rating: 3,
    comment: "The property is decent but there were some issues with water supply initially. The landlord eventually resolved it but it took longer than expected. Otherwise, the place is okay.",
    created_at: "2024-10-28T16:45:00Z",
 7
  },
  {
    id: 5,
    reviewer_name: "Emmanuel Boateng",
    reviewer_avatar: null,
    rating: 5,
    comment: "Fantastic! The landlord went above and beyond to make sure we were comfortable. Property is clean, spacious, and in a great location. Would definitely recommend to anyone looking for a place.",
    created_at: "2024-10-20T11:30:00Z",
 31
  },
  {
    id: 6,
    reviewer_name: "Abena Yeboah",
    reviewer_avatar: null,
    rating: 4,
    comment: "Nice property with good amenities. The landlord is friendly and approachable. Only giving 4 stars because the WiFi connection could be stronger, but overall very satisfied.",
    created_at: "2024-10-15T13:00:00Z",
 9
  },
  {
    id: 7,
    reviewer_name: "Kwesi Owusu",
    reviewer_avatar: null,
    rating: 5,
    comment: "Lived here for 6 months now and couldn't be happier. The landlord is respectful of privacy and always quick to respond to any concerns. The property is secure and well-maintained.",
    created_at: "2024-10-08T08:20:00Z",
 15
  },
  {
    id: 8,
    reviewer_name: "Grace Antwi",
    reviewer_avatar: null,
    rating: 4,
    comment: "Good value for money. The property is as advertised and the landlord is honest. Had a few minor maintenance issues but they were resolved within reasonable time.",
    created_at: "2024-09-30T15:50:00Z",
 6
  },
  {
    id: 9,
    reviewer_name: "Kofi Asante",
    reviewer_avatar: null,
    rating: 5,
    comment: "Outstanding landlord and property! Everything is modern, clean, and functional. The compound is secure with 24/7 security. Communication with the landlord is excellent. 10/10 would rent again!",
    created_at: "2024-09-22T10:10:00Z",
 22
  },
  {
    id: 10,
    reviewer_name: "Adjoa Serwaa",
    reviewer_avatar: null,
    rating: 3,
    comment: "The property is okay but not as spacious as the pictures suggested. The landlord is decent but could be more proactive with maintenance. It's liveable but nothing special.",
    created_at: "2024-09-15T12:40:00Z",
 4
  },
  {
    id: 11,
    reviewer_name: "Yaw Agyeman",
    reviewer_avatar: null,
    rating: 5,
    comment: "Highly professional landlord who really cares about tenant satisfaction. The property is in excellent condition and the area is peaceful. Parking is ample and security is tight. Couldn't ask for more!",
    created_at: "2024-09-08T14:25:00Z",
 19
  },
  {
    id: 12,
    reviewer_name: "Efua Amoako",
    reviewer_avatar: null,
    rating: 4,
    comment: "Great experience renting here. The landlord is understanding and flexible. Property has all the basic amenities you need. The neighborhood is quiet and family-friendly. Would recommend!",
    created_at: "2024-08-30T09:35:00Z",
 11
  }
];

/**
 * Function to simulate fetching reviews with pagination
 */
export const getMockReviews = (page = 1, perPage = 5) => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedReviews = mockReviews.slice(startIndex, endIndex);
  
  return {
    reviews: paginatedReviews,
    pagination: {
      current_page: page,
      per_page: perPage,
      total: mockReviews.length,
      last_page: Math.ceil(mockReviews.length / perPage)
    },
    average_rating: calculateAverageRating(mockReviews),
    total_reviews: mockReviews.length
  };
};

/**
 * Calculate average rating from reviews array
 */
export const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

/**
 * Get rating distribution
 */
export const getRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    if (review.rating) {
      distribution[review.rating]++;
    }
  });
  return distribution;
};


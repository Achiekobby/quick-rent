import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Calendar, 
  MessageCircle, 
  ChevronLeft, 
  Filter, 
  CheckCircle2, 
  Trash2, 
  X, 
  ArrowLeft,
  Clock,
  Search,
  User,
  Home,
  Send,
  PaperclipIcon,
  Smile,
  Image,
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import Colors from "../../utils/Colors";
import Images from "../../utils/Images";

const Notifications = () => {
  // Mock messages data - in a real app, this would come from an API
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "message",
      sender: "John Smith (Landlord)",
      title: "Response to your inquiry",
      message: "Hello, I'm glad you're interested in my property at East Legon. Yes, it's still available for viewing this weekend. Would Saturday at 2 PM work for you? I can meet you at the property to show you around and answer any questions you might have. Please let me know if that time works for you.",
      time: "10 minutes ago",
      timestamp: new Date(Date.now() - 10 * 60000),
      read: false,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      propertyId: 103,
      propertyTitle: "Modern 3-Bedroom Apartment in East Legon",
      propertyImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      conversation: [
        {
          id: 1,
          sender: "You",
          message: "Hello, I'm interested in your property at East Legon. Is it still available for viewing this weekend?",
          time: "Yesterday, 4:30 PM",
          isUser: true
        },
        {
          id: 2,
          sender: "John Smith",
          message: "Hello, I'm glad you're interested in my property at East Legon. Yes, it's still available for viewing this weekend. Would Saturday at 2 PM work for you?",
          time: "10 minutes ago",
          isUser: false
        }
      ]
    },
    {
      id: 2,
      type: "system",
      sender: "Quick Rent",
      title: "Viewing request confirmed",
      message: "Your request to view the apartment at Cantonments has been confirmed for Saturday, June 10th at 2:00 PM. The landlord will meet you at the property. Please arrive 5 minutes early.",
      time: "2 hours ago",
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: false,
      avatar: Images.logo,
      propertyId: 105,
      propertyTitle: "Luxury Apartment in Cantonments",
      propertyImage: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80",
      conversation: [
        {
          id: 1,
          sender: "Quick Rent",
          message: "Your viewing request has been sent to the landlord.",
          time: "Yesterday, 2:15 PM",
          isUser: false
        },
        {
          id: 2,
          sender: "Quick Rent",
          message: "Your request to view the apartment at Cantonments has been confirmed for Saturday, June 10th at 2:00 PM. The landlord will meet you at the property. Please arrive 5 minutes early.",
          time: "2 hours ago",
          isUser: false
        }
      ]
    },
    {
      id: 3,
      type: "system",
      sender: "Quick Rent",
      title: "Price drop alert",
      message: "A property you saved has reduced its price by GH₵200. Check it out now before someone else grabs this deal!",
      time: "Yesterday",
      timestamp: new Date(Date.now() - 24 * 3600000),
      read: true,
      avatar: Images.logo,
      propertyId: 107,
      propertyTitle: "Cozy Studio in Osu",
      propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      conversation: [
        {
          id: 1,
          sender: "Quick Rent",
          message: "A property you saved has reduced its price by GH₵200. Check it out now before someone else grabs this deal!",
          time: "Yesterday",
          isUser: false
        }
      ]
    },
    {
      id: 4,
      type: "message",
      sender: "Michael Addo (Landlord)",
      title: "Response to your question",
      message: "Yes, the property comes with 24/7 security and backup power. The security team is on-site and there's a standby generator that automatically kicks in during power outages. Let me know if you have any other questions!",
      time: "2 days ago",
      timestamp: new Date(Date.now() - 2 * 24 * 3600000),
      read: true,
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      propertyId: 102,
      propertyTitle: "Spacious 2-Bedroom in Airport Residential",
      propertyImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      conversation: [
        {
          id: 1,
          sender: "You",
          message: "Does the property have 24/7 security and backup power?",
          time: "3 days ago",
          isUser: true
        },
        {
          id: 2,
          sender: "Michael Addo",
          message: "Yes, the property comes with 24/7 security and backup power. The security team is on-site and there's a standby generator that automatically kicks in during power outages. Let me know if you have any other questions!",
          time: "2 days ago",
          isUser: false
        }
      ]
    },
    {
      id: 5,
      type: "system",
      sender: "Quick Rent",
      title: "New properties matching your search",
      message: "We found 5 new properties that match your recent search criteria in Labone. Take a look at these new listings before they're gone!",
      time: "3 days ago",
      timestamp: new Date(Date.now() - 3 * 24 * 3600000),
      read: true,
      avatar: Images.logo,
      propertyId: null,
      propertyTitle: null,
      propertyImage: null,
      conversation: [
        {
          id: 1,
          sender: "Quick Rent",
          message: "We found 5 new properties that match your recent search criteria in Labone. Take a look at these new listings before they're gone!",
          time: "3 days ago",
          isUser: false
        }
      ]
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  const handleMessageClick = (id) => {
    // Find the message
    const message = messages.find(m => m.id === id);
    
    // Mark as read if not already
    if (message && !message.read) {
      setMessages(messages.map(m => 
        m.id === id ? { ...m, read: true } : m
      ));
    }
    
    // Set as selected
    setSelectedMessage(message);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const markAllAsRead = () => {
    setMessages(messages.map(message => ({ ...message, read: true })));
  };

  const deleteMessage = (id, e) => {
    e.stopPropagation();
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  const clearAllMessages = () => {
    setMessages([]);
    setSelectedMessage(null);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    // Add the new message to the conversation
    const updatedMessages = messages.map(message => {
      if (message.id === selectedMessage.id) {
        const updatedConversation = [
          ...message.conversation,
          {
            id: message.conversation.length + 1,
            sender: "You",
            message: replyText,
            time: "Just now",
            isUser: true
          }
        ];
        return {
          ...message,
          conversation: updatedConversation
        };
      }
      return message;
    });

    setMessages(updatedMessages);
    setSelectedMessage({
      ...selectedMessage,
      conversation: [
        ...selectedMessage.conversation,
        {
          id: selectedMessage.conversation.length + 1,
          sender: "You",
          message: replyText,
          time: "Just now",
          isUser: true
        }
      ]
    });
    setReplyText("");
  };

  // Get message icon based on type
  const getMessageIcon = (type, size = 16) => {
    switch (type) {
      case "message":
        return <MessageCircle size={size} className="text-white" />;
      case "system":
        return <Bell size={size} className="text-white" />;
      default:
        return <Bell size={size} className="text-white" />;
    }
  };

  // Get message color based on type
  const getMessageColor = (type) => {
    switch (type) {
      case "message":
        return "#4F46E5"; // Indigo
      case "system":
        return "#F59E0B"; // Amber
      default:
        return "#6B7280"; // Gray
    }
  };

  // Filter messages
  const filteredMessages = messages
    .filter(message => {
      if (filter === "all") return true;
      if (filter === "unread") return !message.read;
      return message.type === filter;
    })
    .filter(message => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        message.title.toLowerCase().includes(query) ||
        message.message.toLowerCase().includes(query) ||
        message.sender.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
            {/* Sidebar */}
            <div className={`border-r border-gray-100 ${selectedMessage ? 'hidden md:block' : ''} md:col-span-1`}>
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Motion.button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter size={18} className="text-gray-600" />
                  </Motion.button>
                  {unreadCount > 0 && (
                    <Motion.button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllAsRead}
                    >
                      <CheckCircle2 size={18} className="text-gray-600" />
                    </Motion.button>
                  )}
                  {messages.length > 0 && (
                    <Motion.button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      whileTap={{ scale: 0.95 }}
                      onClick={clearAllMessages}
                    >
                      <Trash2 size={18} className="text-gray-600" />
                    </Motion.button>
                  )}
                </div>
              </div>

              {/* Filter dropdown */}
              <AnimatePresence>
                {isFilterOpen && (
                  <Motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-b border-gray-100"
                  >
                    <div className="p-4 bg-gray-50">
                      <div className="mb-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          {searchQuery && (
                            <button 
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setSearchQuery("")}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'all', label: 'All', icon: <Bell size={14} /> },
                          { id: 'unread', label: 'Unread', icon: <CheckCircle2 size={14} /> },
                          { id: 'message', label: 'Landlords', icon: <MessageCircle size={14} /> },
                          { id: 'system', label: 'Quick Rent', icon: <Bell size={14} /> }
                        ].map(option => (
                          <Motion.button
                            key={option.id}
                            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
                              filter === option.id 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setFilter(option.id)}
                          >
                            {option.icon}
                            {option.label}
                          </Motion.button>
                        ))}
                      </div>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Messages list */}
              <div className="h-[calc(100vh-250px)] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <MessageCircle size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500">No messages found</p>
                    {(filter !== 'all' || searchQuery) && (
                      <button 
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => {
                          setFilter('all');
                          setSearchQuery('');
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map((message) => (
                      <Motion.div
                        key={message.id}
                        className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !message.read ? 'bg-blue-50' : ''
                        } ${selectedMessage?.id === message.id ? 'bg-blue-100' : ''}`}
                        onClick={() => handleMessageClick(message.id)}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="flex items-start">
                          <div 
                            className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 mr-3 relative"
                            style={{ 
                              backgroundImage: `url(${message.avatar})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          >
                            <div 
                              className="absolute bottom-0 right-0 h-5 w-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: getMessageColor(message.type) }}
                            >
                              {getMessageIcon(message.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-900 truncate">{message.sender}</p>
                              <div className="flex items-center ml-2">
                                <span className="text-xs text-gray-500 whitespace-nowrap mr-2">{message.time}</span>
                                <button 
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  onClick={(e) => deleteMessage(message.id, e)}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-800 mt-0.5">{message.title}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</p>
                          </div>
                          {!message.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 ml-2 mt-2"></span>
                          )}
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detail View */}
            <div className={`${selectedMessage ? 'block' : 'hidden md:block'} md:col-span-2 lg:col-span-3 h-[calc(100vh-100px)] overflow-hidden bg-gray-50 flex flex-col`}>
              {selectedMessage ? (
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="bg-white p-5 border-b border-gray-100 sticky top-0 z-10">
                    <div className="flex items-center">
                      <button 
                        className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100"
                        onClick={handleBackToList}
                      >
                        <ArrowLeft size={20} className="text-gray-600" />
                      </button>
                      <div 
                        className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 mr-3"
                        style={{ 
                          backgroundImage: `url(${selectedMessage.avatar})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{selectedMessage.sender}</h2>
                        <p className="text-sm text-gray-500">{selectedMessage.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      {selectedMessage.conversation.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.isUser 
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{msg.sender}</span>
                              <span className="text-xs opacity-70 ml-2">{msg.time}</span>
                            </div>
                            <p className="whitespace-pre-line">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Property info (if applicable) */}
                    {selectedMessage.propertyId && (
                      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Related Property</h4>
                          <Link 
                            to={`/properties/${selectedMessage.propertyId}`}
                            className="flex items-start hover:bg-gray-50 p-3 rounded-lg transition-colors"
                          >
                            <div 
                              className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 mr-3"
                              style={{ 
                                backgroundImage: `url(${selectedMessage.propertyImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{selectedMessage.propertyTitle}</h5>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Home size={14} className="mr-1" />
                                <span>View property details</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reply Box (only for landlord messages) */}
                  {selectedMessage.type === "message" && (
                    <div className="bg-white border-t border-gray-100 p-4">
                      <div className="flex items-end">
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                          <textarea
                            className="w-full px-4 pt-3 pb-2 bg-transparent outline-none resize-none"
                            placeholder="Type your message..."
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          ></textarea>
                          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
                            <div className="flex space-x-2">
                              <button className="p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                <Image size={18} className="text-gray-500" />
                              </button>
                              <button className="p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                <Smile size={18} className="text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button 
                          className={`ml-2 p-3 rounded-full ${
                            replyText.trim() ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                          } transition-colors`}
                          onClick={handleSendReply}
                          disabled={!replyText.trim()}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="max-w-md text-center px-4">
                    <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Select a message</h2>
                    <p className="text-gray-500">
                      Choose a message from the list to view the conversation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Notifications; 
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Search, PlayCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, profileRes] = await Promise.all([
          api.get('/courses'),
          api.get('/users/profile')
        ]);
        
        setCourses(coursesRes.data);
        setEnrolledCourses(profileRes.data.user.enrolledCourses || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(enrolled => enrolled._id === courseId);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-12 pb-12">
      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="text-primary" /> My Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => (
              <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} alt={course.title} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1">{course.title}</h3>
                  <Link 
                    to={`/learn/${course._id}`}
                    className="inline-flex items-center justify-center w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" /> Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Courses Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Explore Courses</h2>
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} alt={course.title} className="w-full h-40 object-cover" />
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{course.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{course.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-lg text-gray-900">${course.price}</span>
                  <Link 
                    to={`/course/${course._id}`}
                    className={`text-sm font-medium py-1.5 px-4 rounded-full transition-colors ${
                      isEnrolled(course._id) 
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-primary text-white hover:bg-primary-hover"
                    }`}
                  >
                    {isEnrolled(course._id) ? 'View Details' : 'Enroll Now'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses found matching your search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

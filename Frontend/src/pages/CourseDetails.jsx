import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Play, BookOpen, Clock } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourseData(data);
        
        if (user && user.role === 'user') {
          const profileRes = await api.get('/users/profile');
          const enrolled = profileRes.data.user.enrolledCourses.some(c => c._id === id);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await api.post('/enrollments/mock-payment-enroll', { courseId: id });
      setIsEnrolled(true);
      // Optional: show a success toast here
    } catch (error) {
      console.error("Enrollment failed:", error);
      alert(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!courseData?.course) return <div className="text-center py-12 text-gray-500">Course not found.</div>;

  const { course, modules } = courseData;
  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Course Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} alt={course.title} className="w-full h-64 md:h-full object-cover" />
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-6 text-lg">{course.description}</p>
            
            <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {modules.length} Modules</div>
              <div className="flex items-center gap-2"><Play className="w-4 h-4" /> {totalLessons} Lessons</div>
            </div>

            <div className="mt-auto flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <span className="text-3xl font-bold text-gray-900">${course.price}</span>
              {isEnrolled ? (
                <button 
                  onClick={() => navigate(`/learn/${course._id}`)}
                  className="bg-secondary text-white font-semibold py-3 px-8 rounded-lg hover:bg-secondary/90 transition shadow-md flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> Go to Course
                </button>
              ) : (
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-hover transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Processing...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
        <div className="space-y-4">
          {modules.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-100 text-center">No modules available yet.</p>
          ) : (
            modules.map((mod, idx) => (
              <div key={mod._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 bg-gray-50 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
                  <span>Module {idx + 1}: {mod.title}</span>
                  <span className="text-sm font-normal text-gray-500">{mod.lessons.length} lessons</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div key={lesson._id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Play className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{lIdx + 1}. {lesson.title}</p>
                      </div>
                    </div>
                  ))}
                  {mod.lessons.length === 0 && <div className="p-4 text-sm text-gray-500 italic">No lessons in this module.</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

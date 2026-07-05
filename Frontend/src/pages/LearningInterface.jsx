import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PlayCircle, CheckCircle, ArrowLeft, Menu, X } from 'lucide-react';

const LearningInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [courseData, setCourseData] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRes = await api.get(`/courses/${id}`);
        setCourseData(courseRes.data);

        // Fetch enrollment details to verify access and get progress
        const enrollRes = await api.get(`/users/enrolled-course/${id}`);
        setEnrollmentId(enrollRes.data._id);
        setCompletedLessons(enrollRes.data.progress?.completedLessons || []);
        
        // Set first lesson as active by default
        if (courseRes.data.modules.length > 0 && courseRes.data.modules[0].lessons.length > 0) {
          setActiveLesson(courseRes.data.modules[0].lessons[0]);
        }
      } catch (error) {
        console.error("Error accessing course:", error);
        alert("You don't have access to this course");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const markComplete = async () => {
    if (!activeLesson) return;
    try {
      await api.post(`/enrollments/progress/${enrollmentId}`, { lessonId: activeLesson._id });
      if (!completedLessons.includes(activeLesson._id)) {
        setCompletedLessons([...completedLessons, activeLesson._id]);
      }
    } catch (error) {
      console.error("Failed to mark complete:", error);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!courseData) return null;

  const { course, modules } = courseData;
  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden absolute inset-0 z-50">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg hidden sm:block truncate max-w-md">{course.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="text-sm font-medium text-gray-300">{progressPercent}%</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-black flex flex-col relative">
          {activeLesson ? (
            <div className="flex flex-col min-h-full">
              {/* Video Player Area */}
              <div className="w-full aspect-video bg-gray-900 shrink-0 flex items-center justify-center">
                {activeLesson.videoUrl ? (
                  <iframe 
                    src={getYoutubeEmbedUrl(activeLesson.videoUrl)} 
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    title={activeLesson.title}
                  ></iframe>
                ) : (
                  <div className="text-gray-500 flex flex-col items-center gap-3">
                    <PlayCircle className="w-16 h-16 opacity-50" />
                    <p>No video available for this lesson</p>
                  </div>
                )}
              </div>
              
              {/* Lesson Details Area */}
              <div className="p-6 md:p-10 max-w-4xl mx-auto w-full flex-1 bg-gray-900 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{activeLesson.title}</h2>
                  </div>
                  <button 
                    onClick={markComplete}
                    className={`shrink-0 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      completedLessons.includes(activeLesson._id)
                        ? 'bg-secondary/20 text-secondary border border-secondary/50'
                        : 'bg-primary text-white hover:bg-primary-hover shadow-lg'
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 ${completedLessons.includes(activeLesson._id) ? '' : 'text-white/80'}`} />
                    {completedLessons.includes(activeLesson._id) ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>
                
                {activeLesson.content && (
                  <div className="prose prose-invert max-w-none text-gray-300">
                    <p className="whitespace-pre-wrap">{activeLesson.content}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a lesson from the sidebar to begin
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-full md:w-80' : 'w-0'} shrink-0 bg-gray-800 border-l border-gray-700 transition-all duration-300 overflow-y-auto z-10 absolute md:static inset-y-0 right-0`}>
          <div className="p-4 border-b border-gray-700 md:hidden bg-gray-800 flex justify-between items-center sticky top-0 z-20">
            <span className="font-bold">Course Curriculum</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="py-2">
            {modules.map((mod, mIdx) => (
              <div key={mod._id} className="mb-2">
                <div className="px-4 py-3 bg-gray-900/50 text-sm font-bold text-gray-300 sticky top-0 z-10">
                  Section {mIdx + 1}: {mod.title}
                </div>
                <div>
                  {mod.lessons.map((lesson, lIdx) => {
                    const isActive = activeLesson?._id === lesson._id;
                    const isCompleted = completedLessons.includes(lesson._id);
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => {
                          setActiveLesson(lesson);
                          if(window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3 transition-colors ${
                          isActive ? 'bg-primary/20 border-l-4 border-primary text-white' : 'hover:bg-gray-700/50 text-gray-400 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-secondary" />
                          ) : (
                            <PlayCircle className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                          )}
                        </div>
                        <span className={`line-clamp-2 ${isActive ? 'font-medium' : ''}`}>
                          {lIdx + 1}. {lesson.title}
                        </span>
                      </button>
                    )
                  })}
                  {mod.lessons.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-600 italic">No lessons</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LearningInterface;

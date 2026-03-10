import api from './api'

export const examService = {
  getAvailable:       ()                      => api.get('/exams/available'),
  startWAEC:          (subject_id)            => api.post('/exams/waec/start', { subject_id }),
  submitWAEC:         (id, answers)           => api.post(`/exams/waec/${id}/submit`, { answers }),
  getWAECSubjects:    ()                      => api.get('/questions/waec-subjects'),
  getWAECOverall:     ()                      => api.get('/exams/waec/overall'),
  getWAECResult:      (id)                    => api.get(`/exams/waec/results/${id}`),
  startJAMB:          (university_id, course_id) => api.post('/exams/jamb/start', { university_id, course_id }),
  submitJAMB:         (id, answers)           => api.post(`/exams/jamb/${id}/submit`, { answers }),
  getJAMBResult:      (id)                    => api.get(`/exams/jamb/results/${id}`),
  startPostUTME:      (university_id, course_id) => api.post('/exams/post-utme/start', { university_id, course_id }),
  submitPostUTME:     (id, answers)           => api.post(`/exams/post-utme/${id}/submit`, { answers }),
  getPostUTMEResult:  (id)                    => api.get(`/exams/post-utme/results/${id}`),
  getHistory:         ()                      => api.get('/exams/history'),
}

export const practiceService = {
  getSubjects:    ()                         => api.get('/practice/subjects'),
  getTopics:      (subject_id)               => api.get(`/practice/topics/${subject_id}`),
  start:          (subject_id, topic_id, num) => api.post('/practice/start', { subject_id, topic_id, num_questions: num }),
  submit:         (id, answers)              => api.post(`/practice/sessions/${id}/submit`, { answers }),
  getRecommended: ()                         => api.get('/practice/recommended'),
  getMySessions:  ()                         => api.get('/practice/my-sessions'),
}

export const universityService = {
  list:       (params)          => api.get('/universities/', { params }),
  getById:    (id)              => api.get(`/universities/${id}`),
  getCourses: (id)              => api.get(`/universities/${id}/courses`),
  getCourse:  (id)              => api.get(`/universities/courses/${id}`),
  recommend:  (jamb_score, course_interest) =>
                api.post('/universities/recommend', { jamb_score, course_interest }),
  select:     (university_id, course_id) =>
                api.post('/universities/select', { university_id, course_id }),
}

export const advisorService = {
  chat:               (message, context, conversation_id) =>
                        api.post('/advisor/chat', { message, context: "admission" }),
                        //api.post('/advisor/chat', { message, context, conversation_id }),
  analyzePerformance: (attempt_id)  => api.post(`/advisor/analyze/${attempt_id}`),
  getHistory:         ()            => api.get('/advisor/history'),
  getConversation:    (id)          => api.get(`/advisor/history/${id}`),
  submitAssessment:   (responses)   => api.post('/advisor/career-assessment', { responses }),
  getAssessment:      ()            => api.get('/advisor/career-assessment'),
}

export const dashboardService = {
  getDashboard:  () => api.get('/student/dashboard'),
  getTrends:     () => api.get('/student/performance-trends'),
  getHistory:    () => api.get('/student/exam-history'),
}

export const admissionGuideService = {
   getSubjects: () => api.get('/admission-guide/subjects'),
   analyze: (payload) => api.post('/admission-guide/analyze', payload),
 }

  export const analyticsService = {
   getAnalytics: () => api.get('/student/analytics'),
 }

import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import FormSubmissionView from '@/views/forms/FormSubmissionView'
import FormSubmissionEdit from '@/views/forms/FormSubmissionEdit'
import StudyList from '@/views/studies/StudyList'
import StudyCreate from '@/views/studies/StudyCreate'
import StudyEdit from '@/views/studies/StudyEdit'
import StudyPatientList from '@/views/studies/StudyPatientList'
import PatientLayoutRoute from '@/components/layouts/PatientLayoutRoute'
import PatientStudyDetail from '@/views/users/StudyForms'

const SignIn = lazy(() => import('@/views/auth/SignIn'));
const FormList = lazy(() => import('@/views/forms/FormList'));
const FormDetail = lazy(() => import('@/views/forms/FormDetail'));
const FormCreate = lazy(() => import('@/views/forms/FormCreate'));
const PatientLogin = lazy(() => import('@/views/auth/PatientLogin'));
const PatientDashboard = lazy(() => import('@/views/users/Dashboard'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/login" element={<PatientLogin />} />
      
      {/* Patient Routes */}
      <Route path="/users" element={<PatientLayoutRoute />}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="studies/:id" element={<PatientStudyDetail />} />
        {/* Add other patient routes here */}
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/" replace />} />
        <Route path="forms" element={<FormList />} />
        <Route path="forms/create" element={<FormCreate />} />
        <Route path="forms/:id" element={<FormDetail />} />
        <Route path="forms/:id/submissions" element={<PatientLogin />} />
        <Route path="forms/:id/submissions/:submissionId/view" element={<FormSubmissionView />} />
        <Route path="forms/:id/submissions/:submissionId/edit" element={<FormSubmissionEdit />} />
      </Route>

      <Route path="/studies" element={<StudyList />} />
      <Route path="/studies/create" element={<StudyCreate />} />
      <Route path="/studies/:id/edit" element={<StudyEdit />} />
      <Route path="/studies/:id/patients" element={<StudyPatientList />} />

      {/* Catch all route - redirect to forms */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './toastStyles.css';
import { AuthProvider } from './providers/AuthProvider';
import RequireAuth from './RequireAuth.js';
import RequireRole from './providers/RequireRole';
import { MenuProvider } from './ui-components/MenuContext';

import PhysicalFacilities from "./ui-components/school_evaluation/PhysicalFacilities";
import SchoolEvaluationDashboard from "./ui-components/school_evaluation/SchoolEvaluationDashboard";
import SchoolEvaluationPreview from "./ui-components/school_evaluation/SchoolEvaluationPreview";
import CreateDeath from "./ui-components/death/CreateDeath";
import StaffDeathDetails from "./ui-components/death/StaffDeathDetails";
import StaffResignationDetails from "./ui-components/resignation/StaffResignationDetails";
import CreateResignation from "./ui-components/resignation/CreateResignation";
import ApprovedCandidates from "./ui-components/ApprovedCandidates";

// import ExamApplication from './ui-components/ExamApplication.js';

const StaffDashboard = lazy(() => import('./ui-components/dashboard/StaffDashboard'));
const SchoolAdminDashboard = lazy(() => import('./ui-components/dashboard/SchoolAdminDashboard'));
const MasterLayout = lazy(() => import('./ui-components/MasterLayout'));
const Dashboard = lazy(() => import('./ui-components/Dashboard'));

const ChangePassword = lazy(() => import('./ui-components/ChangePassword'));

const Forane = lazy(() => import('./ui-components/Forane'));
const Parish = lazy(() => import('./ui-components/Parish'));
const Convent = lazy(() => import('./ui-components/Convent'));
const School = lazy(() => import('./ui-components/School'));
const SchoolDetails = lazy(() => import('./ui-components/SchoolDetails'));
const Subject = lazy(() => import('./ui-components/Subject'));
const SchoolNotification = lazy(() => import('./ui-components/SchoolNotification.js'));
const Notification = lazy(() => import('./ui-components/Notification.js'));
const ClassStrength = lazy(() => import('./ui-components/ClassStrength'));
const SchoolAlbum = lazy(() => import('./ui-components/SchoolAlbum'));
const SchoolGallery = lazy(() => import('./ui-components/SchoolGallery.js'));
const ExamApplication = lazy(() => import('./ui-components/ExamApplication.js'));
const ExamApplicationDetails = lazy(() => import('./ui-components/ExamApplicationDetails.js'));
const TransferNotification = lazy(() => import('./ui-components/TransferNotification.js'));
const StaffTransferApplication = lazy(() => import('./ui-components/StaffTransferApplication.js'));
const TransferRequest = lazy(() => import('./ui-components/TransferRequest.js'));
const TransferList = lazy(() => import('./ui-components/TransferList.js'));
const PendingStaffService = lazy(() => import('./ui-components/PendingStaffService.js'));

const Staff = lazy(() => import('./ui-components/Staff'));
const StaffDetails = lazy(() => import('./ui-components/StaffDetails'))

const AddCocurricular = lazy(() => import('./ui-components/AddCocurricular'));
const SchoolProfile = lazy(() => import('./ui-components/SchoolProfile'));
const SchoolClass = lazy(() => import('./ui-components/SchoolClass'));
const SchoolViewNotification = lazy(() => import('./ui-components/SchoolViewNotification'));

const StaffLeaveRequest = lazy(() => import('./ui-components/StaffLeaveRequest'));
const StaffViewNotification = lazy(() => import('./ui-components/StaffViewNotification'));
const Users = lazy(() => import('./ui-components/OfficeUsers'));
const LeaveApplications = lazy(() => import('./ui-components/LeaveApplications'));
const LeaveDetailsView = lazy(() => import('./ui-components/LeaveDetailsView'));
const SchoolAdminStaff = lazy(() => import('./ui-components/SchoolAdminStaff'));

const Login = lazy(() => import('./Login'));
const CandidateLogin = lazy(() => import('./CandidateLogin'));
const CandidateForgotPassword = lazy(() => import('./CandidateForgotPassword'));
const CandidateOtpVerification = lazy(() => import('./CandidateOtpVerification'));
const CandidateUpdatePassword = lazy(() => import('./CandidateUpdatePassword'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const OtpVerification = lazy(() => import('./OtpVerification'));
const UpdatePassword = lazy(() => import('./UpdatePassword'));

const CandidateRegistration = lazy(() => import('./CandidateRegistration'));
const RegistrationSuccess = lazy(() => import('./RegistrationSuccess'));
const RetiredStaffRegistration = lazy(() => import('./RetiredStaffRegistration'));
const RetiredRegistrationSuccess = lazy(() => import('./RetiredRegistrationSuccess'));

//const EducationDepartment = lazy(() =>import('./ui-components/EducationDepartment'));
const RDD = lazy(() => import('./ui-components/RDDForm'));
const DDE = lazy(() => import('./ui-components/DDEForm'));
const DEO = lazy(() => import('./ui-components/DEOForm'));
const AEO = lazy(() => import('./ui-components/AEOForm'));
const AEOList = lazy(() => import('./ui-components/AEOList'));
const DEOList = lazy(() => import('./ui-components/DEOList'));
const Treasury = lazy(() => import('./ui-components/Treasury'));
const Congregation = lazy(() => import('./ui-components/Congregation'));
//Reports
const CandidateReport = lazy(() => import('./ui-components/reports/CandidateReport'));
const LeaveReport = lazy(() => import('./ui-components/reports/LeaveReport'));
const PromotionsReport = lazy(() => import('./ui-components/reports/PromotionsReport'));
const SeniorityReport = lazy(() => import('./ui-components/reports/StaffSeniorityReport'));
const ServiceRecordsReport = lazy(() => import('./ui-components/reports/ServiceRecordsReport'));
const StaffServiceHistoryReport = lazy(() => import('./ui-components/reports/StaffServiceHistoryReport'));
const StaffServiceHistory = lazy(() => import('./ui-components/reports/StaffServiceHistory'));

const TransfersReport = lazy(() => import('./ui-components/reports/TransfersReport'));
const VaccancyReport = lazy(() => import('./ui-components/reports/VaccancyReport'));
const StaffReport = lazy(() => import('./ui-components/reports/StaffReport'));
const StaffServiceDetails = lazy(() => import('./ui-components/StaffServiceDetails'));
const StaffMovementReport = lazy(() => import('./ui-components/reports/StaffMovementReport'));
const SchoolReport = lazy(() => import('./ui-components/reports/SchoolReport'));
const RankListReport = lazy(() => import('./ui-components/reports/RankListReport'));
const StaffExperienceReport = lazy(() => import('./ui-components/reports/StaffExperienceReport'));
const RetirementList = lazy(() => import('./ui-components/reports/RetirementList'));
const DesignationReport = lazy(() => import('./ui-components/reports/DesignationReport'));
const ClassStrengthReport = lazy(() => import('./ui-components/reports/ClassStrengthReport'));
const StudentStrengthReport = lazy(() => import('./ui-components/reports/StudentStrengthReport'));

const AcademicYear = lazy(() => import('./ui-components/AcademicYear'));
const Designations = lazy(() => import('./ui-components/Designations'));
const Zone = lazy(() => import('./ui-components/Zone'));


// const SchoolProfile = lazy(() => import('./ui-components/SchoolProfile'));
const CandidateApplicationDetails = lazy(() => import('./ui-components/CandidateApplicationDetails'));
const AppliedCandidates = lazy(() => import('./ui-components/AppliedCandidates'));
const CertificateVerificationSchedule = lazy(() => import('./ui-components/CertificateVerificationSchedule'));


const StaffLeaveList = lazy(() => import('./ui-components/StaffLeaveList'));
const SchoolEvaluation = lazy(() => import('./ui-components/SchoolEvaluation'));
const SchoolCategoryItem = lazy(() => import('./ui-components/SchoolCategoryItem'));
const SchoolEvaluationForm = lazy(() => import('./ui-components/school_evaluation/SchoolEvaluationForm'));


const SchoolEvaluationNotifications = lazy(() => import('./ui-components/SchoolEvaluationNotifications'));

const ViewEvaluationNotifications = lazy(() => import('./ui-components/ViewEvaluationNotifications'));
const ApprovedLeaveApplications = lazy(() => import('./ui-components/ApprovedLeaveApplications'));


const News = lazy(() => import('./ui-components/News'));

const MarksCategory = lazy(() => import('./ui-components/MarksCategory'));
const MarkList = lazy(() => import('./ui-components/MarkList'));
const CandidateViewMarks = lazy(() => import('./ui-components/candidate/CandidateViewMarks'));
const CandidateMarkList = lazy(() => import('./ui-components/CandidateMarkList'));
const RankList = lazy(() => import('./ui-components/RankList'));
const CandidateExamRankList = lazy(() => import('./ui-components/CandidateExamRankList'));
const CandidateRankListPDF = lazy(() => import('./ui-components/CandidateRankListPDF'));

const CandidateManagement = lazy(() => import('./ui-components/candidate/CandidateManagement'));
const ApprovedCandidatesList = lazy(() => import('./ui-components/candidate/ApprovedCandidatesList'));
const CandidateBasicinfo = lazy(() => import('./ui-components/candidate/CandidateBasicinfo'));
const CandidateProfile = lazy(() => import('./ui-components/candidate/CandidateProfile'));
const CandidateExamNotifications = lazy(() => import('./ui-components/candidate/CandidateExamNotifications'));
const ExamNotificationSubjects = lazy(() => import('./ui-components/ExamNotificationSubjects'));
const CandidatePreviewExam = lazy(() => import('./ui-components/candidate/CandidatePreviewExam'));
const CandidateFamilyDetails = lazy(() => import('./ui-components/candidate/CandidateFamilyDetails'));
const Candidate_co_curricular = lazy(() => import('./ui-components/candidate/Candidate_co_curricular'));
const Religious_activities = lazy(() => import('./ui-components/candidate/Religious_activities'));
const VacancySettings = lazy(() => import('./ui-components/VacancySettings'));
const Vacancy = lazy(() => import('./ui-components/vacancy/Vacancy'));
const StaffTransferRequest = lazy(() => import('./ui-components/StaffTransferRequest'));
const AddScore = lazy(() => import('./ui-components/AddScore'));
const SchoolEvaluationList = lazy(() => import('./ui-components/SchoolEvaluationList'));
const CreateTransfer = lazy(() => import('./ui-components/CreateTransfer'));
const CandidateexamGuidelines = lazy(() => import('./ui-components/candidate/CandidateexamGuidelines'));
const CandidateMarkGuidelines = lazy(() => import('./ui-components/candidate/CandidateMarkGuidelines'));
const Data_Settings = lazy(() => import('./ui-components/Data_Settings'));
const Resignation = lazy(() => import('./ui-components/resignation/Resignation'));
const Death = lazy(() => import('./ui-components/death/StaffDeath'));
const StaffList = lazy(() => import('./ui-components/StaffList'));
const SchoolManager = lazy(() => import('./ui-components/SchoolManager'));
const CreateLeaveRequest = lazy(() => import('./ui-components/CreateLeaveRequest'));
const StaffLeaveApplicationLetter = lazy(() => import('./ui-components/StaffLeaveApplicationLetter'));
const SchoolMedia = lazy(() => import('./ui-components/SchoolMedia'));
const SchoolActivity = lazy(() => import('./ui-components/school_evaluation/SchoolActivity'));
const ExaminationResults = lazy(() => import('./ui-components/school_evaluation/ExaminationResults'));
const OverallChampionship = lazy(() => import('./ui-components/school_evaluation/OverallChampionship'));
const Achievements = lazy(() => import('./ui-components/school_evaluation/Achievements'));
const SchoolInnovations = lazy(() => import('./ui-components/school_evaluation/SchoolInnovations'));


const SchoolManagersList = lazy(() => import('./ui-components/SchoolManagersList'));
const StaffPromotionForm = lazy(() => import('./ui-components/StaffPromotionForm'));
const TransferApplicationLetter = lazy(() => import('./ui-components/TransferApplicationLetter'));
const EditTransferApplication = lazy(() => import('./ui-components/EditTransferApplication'));
const ApprovedTransferApplications = lazy(() => import('./ui-components/ApprovedTransferRequests'));
const PendingTransferApplications = lazy(() => import('./ui-components/PendingTransferRequests'));
const SchoolManagerProfile = lazy(() => import("./ui-components/SchoolManagerProfile"));
const StaffPromotionRequests = lazy(() => import("./ui-components/StaffPromotionRequests"));
const StaffPromotionApplicationLetter = lazy(() => import("./ui-components/StaffPromotionApplicationLetter"));
const Club = lazy(() => import("./ui-components/Club"));
const SchoolMagazines = lazy(() => import("./ui-components/school_evaluation/SchoolMagazines"));
const StaffPromotionEditForm = lazy(() => import("./ui-components/StaffPromotionEditForm"));
const SampleRankList = lazy(() => import("./ui-components/SampleRankList"));
const SchoolEvaluationReport = lazy(() => import("./ui-components/school_evaluation/SchoolEvaluationReport"));
const VacancyNotifications = lazy(() => import("./ui-components/vacancy/UpcomingVacancyNotifications.js"));
const VacancyDetails = lazy(() => import("./ui-components/vacancy/VacancyDetails"));
const CreateVacancy = lazy(() => import("./ui-components/vacancy/CreateVacancy"));
const NatureVacancy = lazy(() => import("./ui-components/vacancy/NatureVacancy"));
const VacancyDesignation = lazy(() => import("./ui-components/vacancy/VacancyDesignation"));
const StaffRetirementDetails = lazy(() => import('./ui-components/retirement/StaffRetirementDetails'));
const StaffRetirement = lazy(() => import('./ui-components/retirement/StaffRetirement'));
const CreateRetirement = lazy(() => import('./ui-components/retirement/CreateRetirement'));
const StaffCocurricular = lazy(() => import("./ui-components/StaffCocurricular"));
const StaffAchievement = lazy(() => import("./ui-components/school_evaluation/StaffAchievement"));
const RetiredStaffManagement = lazy(() => import("./ui-components/RetiredStaffManagement"));
const RetiredStaffInfo = lazy(() => import("./ui-components/RetiredStaffInfo"));
const RetiredStaffList = lazy(() => import("./ui-components/RetiredStaffList"));
const RetiredStaffDetails = lazy(() => import("./ui-components/RetiredStaffDetails"));


//Appointment
const Appointment = lazy(() => import('./ui-components/appointment/Appointment'));
const AppointmentDetails = lazy(() => import("./ui-components/appointment/AppointmentDetails"));
const CurrentVacancies = lazy(() => import("./ui-components/appointment/CurrentVacancies"));
const VacancyAppointment = lazy(() => import("./ui-components/appointment/VacancyAppointment"));

//Reports
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>

        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/candidate-login" element={<CandidateLogin />} />
            <Route path="/candidate-forgot-password" element={<CandidateForgotPassword />} />
            <Route path="/candidate-verify-otp" element={<CandidateOtpVerification />} />
            <Route path="/candidate-update-password" element={<CandidateUpdatePassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route path="/update-password" element={<UpdatePassword />} />


            <Route path="/candidate-registration" element={<CandidateRegistration />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/retired-staff-registration" element={<RetiredStaffRegistration />} />
            <Route path="/retired-registration-success" element={<RetiredRegistrationSuccess />} />

            <Route path="/" element={<RequireAuth><MasterLayout /></RequireAuth>}>

              <Route path="change_password" element={<ChangePassword />} />
              <Route path="AcademicYear" element={
                <RequireRole allowedRoles={['corporate_admin']}>
                  <AcademicYear />
                </RequireRole>
              } />
              <Route path="designations" element={
                <RequireRole allowedRoles={['corporate_admin']}>
                  <Designations />
                </RequireRole>
              } />
              <Route path="forane" element={<Forane />} />
              <Route path="parish" element={<Parish />} />
              <Route path="zone" element={<Zone />} />
              <Route path="convent" element={<Convent />} />
              <Route path="school" element={<School />} />
              <Route path="schooldetails/:school_id" element={<SchoolDetails />} />
              <Route path="subject" element={<Subject />} />
              <Route path="classstrength" element={<ClassStrength />} />
              <Route path="schoolalbum" element={<SchoolAlbum />} />
              <Route path="schoolgallery/:album_id" element={<SchoolGallery />} />
              <Route path="schoolnotification" element={<SchoolNotification />} />
              <Route path="notification" element={<Notification />} />
              <Route path="examapplication" element={<ExamApplication />} />
              <Route path="transfernotification" element={<TransferNotification />} />
              <Route path="stafftransferapplication" element={<StaffTransferApplication />} />
              <Route path="transferrequest" element={<TransferRequest />} />
              <Route path="transferlist" element={<TransferList />} />
              <Route path="pendingstaffservice" element={<PendingStaffService />} />

              <Route path="school-media/:school_activity_id" element={<SchoolMedia />} />
              <Route path="staff" element={<Staff />} />
              <Route path="/staffdetails/:staff_id" element={<StaffDetails />} />

              <Route path="schoolprofile" element={<SchoolProfile />} />
              <Route path="schoolclass" element={<SchoolClass />} />
              <Route path="schoolviewnotification" element={<SchoolViewNotification />} />

              <Route path="office-users" element={<Users />} />
              <Route path="staff-leave-request" element={<StaffLeaveRequest />} />
              <Route path="leave-applications" element={<LeaveApplications />} />
              <Route path="leave-details" element={<LeaveDetailsView />} />
              <Route index element={<Dashboard />} />
              <Route path="CandidateDashboard" element={<Dashboard />} />
              <Route path="schooladminstaff" element={<SchoolAdminStaff />} />
              <Route path="transfernotification" element={<TransferNotification />} />
              <Route path="stafftransferapplication" element={<StaffTransferApplication />} />
              <Route path="transferrequest" element={<TransferRequest />} />
              <Route path="pendingstaffservice" element={<PendingStaffService />} />
              <Route path="staff-service-details/:staffId" element={<StaffServiceDetails />} />
              <Route path="mark-category" element={<MarksCategory />} />
              <Route path="mark-list/:application_id" element={<MarkList />} />
              <Route path="/candidate-mark-list/:canididate_application_subject_id" element={<CandidateMarkList />} />
              <Route path="/candidate-view-marks/:canididate_application_subject_id" element={<CandidateViewMarks />} />
              <Route path="rank-list/:canididate_application_subject_id" element={<RankList />} />
              <Route path="candidate-exam-rank-list/:application_id" element={<CandidateExamRankList />} />
              <Route path="exam-application-details/:application_id" element={<ExamApplicationDetails />} />
              <Route path="transferlist" element={<TransferList />} />
              <Route path="exam-application" element={<ExamApplication />} />
              <Route path="approved-candidates" element={<ApprovedCandidates />} />
              <Route path="approved-candidates/:application_id" element={<ApprovedCandidates />} />
              <Route path="candidate-exam-rank-list-pdf/:fk_exam_application_subject_id" element={<CandidateRankListPDF />} />
              <Route path="retired-staff-management" element={<RetiredStaffManagement />} />

              <Route path="staff" element={<Staff />} />
              {/* <Route path="schooladminstaff" element={<SchoolAdminStaff />} /> */}
              <Route path="SchoolAdminStaff/:staffType" element={<SchoolAdminStaff />} />
              <Route path="schoolevaluation" element={<SchoolEvaluation />} />
              <Route path="school-category-item/:fk_category_id" element={<SchoolCategoryItem />} />
              <Route path="schoolevaluation/add_score" element={<AddScore />} />
              <Route path="school-evaluation-form/:evaluation_doc_id" element={<SchoolEvaluationForm />} />
              <Route path="evaluation-list" element={<SchoolEvaluationList />} />
              <Route path="school-evaluation-notification" element={<SchoolEvaluationNotifications />} />
              <Route path="view-evaluation-notifications" element={<ViewEvaluationNotifications />} />
              <Route path="candidate-application-details" element={<CandidateApplicationDetails />} />
              <Route path="applied-candidates" element={<AppliedCandidates />} />
              <Route path="/applied-candidates/:application_id" element={<AppliedCandidates />} />
              <Route path="certificate-verification-schedule/:application_id" element={<CertificateVerificationSchedule />} />

              <Route path="staffdetails/:staff_id" element={<StaffDetails />} />
              <Route path="staff-leave-request" element={<StaffLeaveRequest />} />
              <Route path="leave-applications" element={<LeaveApplications />} />
              <Route path="news" element={<News />} />
              {/* Reports */}
              <Route path="candidate-report" element={<CandidateReport />} />
              <Route path="leave-report" element={<LeaveReport />} />
              <Route path="retirement-list" element={<RetirementList />} />
              <Route path="designation-report" element={<DesignationReport />} />

              <Route path="promotions-report" element={<StaffMovementReport />} />
              <Route path="seniority-report" element={<SeniorityReport />} />
              <Route path="service-records-report" element={<ServiceRecordsReport />} />
              <Route path="service-history-report" element={<StaffServiceHistoryReport />} />
              <Route path="staff-service-history/:staffId" element={<StaffServiceHistory />} />
              <Route path="vaccancy-report" element={<VaccancyReport />} />
              <Route path="staff-report" element={<StaffReport />} />
              <Route path="transfers-report" element={<StaffMovementReport />} />
              <Route path="retired-staff-report" element={<StaffMovementReport />} />
              <Route path="school-report" element={<SchoolReport />} />
              <Route path="vacancy" element={<Vacancy />} />
              <Route path="staff-transfer-request" element={<StaffTransferRequest />} />
              <Route path="rank-list-report" element={<RankListReport />} />
              <Route path="staffviewnotification" element={<StaffViewNotification />} />
              <Route path="staff-experience-report" element={<StaffExperienceReport />} />
              <Route path="class-strength-report" element={<ClassStrengthReport />} />
              <Route path="student-strength-report" element={<StudentStrengthReport />} />

              <Route path="co-curricular" element={<AddCocurricular />} />

              <Route path="edu-rdd" element={<RDD />} />
              <Route path="edu-dde" element={<DDE />} />
              <Route path="edu-deo/:dept_id" element={<DEO />} />
              <Route path="edu-aeo/:dept_id" element={<AEO />} />
              <Route path="congregation" element={<Congregation />} />
              <Route path="AEO-List" element={<AEOList />} />
              <Route path="DEO-List" element={<DEOList />} />
              <Route path="treasury" element={<Treasury />} />
              <Route path="create-transfer" element={<CreateTransfer />} />



              <Route path="staff-list" element={<StaffList />} />
              <Route path="school-managers-list" element={<SchoolManagersList />} />

              <Route path="school-manager" element={<SchoolManager />} />
              <Route path="create-leave-request" element={<CreateLeaveRequest />} />
              <Route path="leave-application-letter/:leave_id" element={<StaffLeaveApplicationLetter />} />
              <Route path="staffcocurricular" element={<StaffCocurricular />} />
              <Route path="staff-leave-list" element={<StaffLeaveList />} />
              <Route path="staff-promotion-request" element={<StaffPromotionForm />} />
              <Route path="approved-leave-applications" element={<ApprovedLeaveApplications />} />
              <Route path="transfer-application-letter/:transfer_application_id" element={<TransferApplicationLetter />} />

              <Route path="/vacancy-settings/:id/:nature_of_vacancy" element={<VacancySettings />} />
              <Route path="edit-transfer-application/:transfer_application_id" element={<EditTransferApplication />} />
              <Route path="approved-transfer-applications" element={<ApprovedTransferApplications />} />
              <Route path="pending-transfer-applications" element={<PendingTransferApplications />} />
              <Route path="school-manager-profile" element={<SchoolManagerProfile />} />
              <Route path="staff-promotion-requests" element={<StaffPromotionRequests />} />
              <Route path="staff-promotion-application/:promotion_detail_id" element={<StaffPromotionApplicationLetter />} />

              <Route path="staff-promotion-edit-form/:promotion_detail_id" element={<StaffPromotionEditForm />} />

              <Route path="club" element={<Club />} />
              <Route path="sample-rank-list" element={<SampleRankList />} />
              <Route path="school-evaluation-report" element={<SchoolEvaluationReport />} />
              <Route path="vacancy-notifications" element={<VacancyNotifications />} />
              <Route path="school-dashboard" element={<SchoolAdminDashboard />} />
              <Route path="staff-dashboard" element={<StaffDashboard />} />

              <Route path="school-magazine" element={<SchoolMagazines />} />
              {/* Alphonse */}
              <Route path="Religious_activities/:candidate_id" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <Religious_activities />
                </RequireRole>
              } />


              <Route path="Data_Settings" element={
                <RequireRole allowedRoles={['corporate_admin']}>
                  <Data_Settings />
                </RequireRole>
              } />

              <Route path="CandidateexamGuidelines" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <CandidateexamGuidelines />
                </RequireRole>
              } />

              <Route path="candidatemarkguidelines" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <CandidateMarkGuidelines />
                </RequireRole>
              } />

              <Route path="CandidateManagement" element={
                <RequireRole allowedRoles={['corporate_admin']}>
                  <CandidateManagement />
                </RequireRole>
              } />

              <Route path="approved-candidates-list" element={
                <RequireRole allowedRoles={['corporate_admin']}>
                  <ApprovedCandidatesList />
                </RequireRole>
              } />

              <Route path="CandidateBasicinfo/:candidate_id" element={
                <RequireRole allowedRoles={['corporate_admin']}>
                  <CandidateBasicinfo />
                </RequireRole>
              } />
              <Route path="ExamNotificationSubjects/:application_id" element={
                <RequireRole allowedRoles={['candidate']}>
                  <ExamNotificationSubjects />
                </RequireRole>
              } />

              <Route path="CandidateExamNotifications" element={
                <RequireRole allowedRoles={['candidate']}>
                  <CandidateExamNotifications />
                </RequireRole>
              } />




              <Route path="CandidateProfile/:candidate_id" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <CandidateProfile />
                </RequireRole>
              } />

              <Route path="CandidateFamilyDetails/:candidate_id" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <CandidateFamilyDetails />
                </RequireRole>
              } />

              <Route path="Candidate_co_curricular/:candidate_id" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <Candidate_co_curricular />
                </RequireRole>
              } />

              <Route path="Religious_activities/:candidate_id" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <Religious_activities />
                </RequireRole>
              } />


              <Route path="CandidatePreviewExam/:application_id" element={
                <RequireRole allowedRoles={['corporate_admin', 'candidate']}>
                  <CandidatePreviewExam />
                </RequireRole>
              } />


              <Route path="vacancy-appointment/:vacancy_id" element={<VacancyAppointment />} />


              <Route path="/school-evaluation-form" element={<SchoolEvaluationForm />}>
                <Route index element={<SchoolEvaluationDashboard />} />
                <Route path="school-evaluation-dashboard" element={<SchoolEvaluationDashboard />} />
                <Route path="school-magazines" element={<SchoolMagazines />} />
                <Route path="physical-facilities" element={<PhysicalFacilities />} />
                <Route path="school-evaluation-preview" element={<SchoolEvaluationPreview />} />
                <Route path="school-activity" element={<SchoolActivity />} />
                <Route path="examination-results" element={<ExaminationResults />} />
                <Route path="staff-achievement" element={<StaffAchievement />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="overall-championship" element={<OverallChampionship />} />
                <Route path="school-innovations" element={< SchoolInnovations />} />

              </Route>



              <Route path="/staff-death-details" element={<StaffDeathDetails />}>
                <Route index element={<Death />} />
                <Route path="death-details" element={<Death />} />
                <Route path="create-death" element={<CreateDeath />} />

              </Route>
              <Route path="/staff-resignation-details" element={<StaffResignationDetails />}>
                <Route index element={<Resignation />} />
                <Route path="resignation-details" element={<Resignation />} />
                <Route path="create-resignation" element={<CreateResignation />} />

              </Route>

              <Route path="/staff-retirement-details" element={<StaffRetirementDetails />}>
                <Route index element={<StaffRetirement />} />
                <Route path="retirement-details" element={<StaffRetirement />} />
                <Route path="create-retirement" element={<CreateRetirement />} />

              </Route>

              <Route path="/vacancy" element={<Vacancy />}>
                <Route index element={<VacancyDetails />} />
                <Route path="vacancy-details" element={<VacancyDetails />} />
                <Route path="create-vacancy" element={<CreateVacancy />} />
                <Route path="designation-vacancy" element={<VacancyDesignation />} />
                <Route path="nature-vacancy" element={<NatureVacancy />} />

              </Route>

              <Route path="/appointment" element={<Appointment />}>
                <Route index element={<AppointmentDetails />} />
                <Route path="appointment-details" element={<AppointmentDetails />} />
                <Route path="current-vacancy" element={<CurrentVacancies />} />

                {/*  <Route path="nature-vacancy" element={<NatureVacancy />} /> */}

              </Route>


              <Route path="retired-staff-info/:staff_id" element={
                <RequireRole allowedRoles={['corporate_admin']}>
                  <RetiredStaffInfo />
                </RequireRole>
              } />

              <Route path="retired-staff-list" element={<RetiredStaffList />} />
              <Route path="retired-staff-details/:staff_id" element={<RetiredStaffDetails />} />


            </Route>
          </Routes>
        </AuthProvider>

      </Suspense>
    </BrowserRouter>

  );
}

export default App;

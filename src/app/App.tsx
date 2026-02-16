import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { NewsProvider } from './contexts/NewsContext';
import { GalleryProvider } from './contexts/GalleryContext';
import { SPMBProvider } from './contexts/SPMBContext';
import { ContentProvider } from './contexts/ContentContext';
import { AcademicProvider } from './contexts/AcademicContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProfilPage } from './pages/ProfilPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AkademikPage } from './pages/AkademikPage';
import { KesiswaanPage } from './pages/KesiswaanPage';
import { BeritaPage } from './pages/BeritaPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { PrestasiPage } from './pages/PrestasiPage';
import { GaleriPage } from './pages/GaleriPage';
import { SPMBPage } from './pages/SPMBPage';
import { DownloadPage } from './pages/DownloadPage';
import { KontakPage } from './pages/KontakPage';
import { LoginPage as AdminLoginPage } from './pages/admin/LoginPage';
import { LoginPage as UserLoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { NewsManagementPage } from './pages/admin/NewsManagementPage';
import { GalleryManagementPage } from './pages/admin/GalleryManagementPage';
import { SPMBManagementPage } from './pages/admin/SPMBManagementPage';
import { ContentManagementPage } from './pages/admin/ContentManagementPage';
import { StatisticsPage } from './pages/admin/StatisticsPage';

import { AchievementProvider } from './contexts/AchievementContext';
import { MessageProvider } from './contexts/MessageContext';
import { DocumentProvider } from './contexts/DocumentContext';

import { AchievementsManagementPage } from './pages/admin/AchievementsManagementPage';
import { DocumentsManagementPage } from './pages/admin/DocumentsManagementPage';
import { MessagesManagementPage } from './pages/admin/MessagesManagementPage';
import { StudentsManagementPage } from './pages/admin/StudentsManagementPage';
import { ActivityLogManagementPage } from './pages/admin/ActivityLogManagementPage';
import { AcademicManagementPage } from './pages/admin/AcademicManagementPage';
import { OrgStructureManagementPage } from './pages/admin/OrgStructureManagementPage';
import { TeacherStaffManagementPage } from './pages/admin/TeacherStaffManagementPage';
import { OsisManagementPage } from './pages/admin/OsisManagementPage';
import { ExtracurricularManagementPage } from './pages/admin/ExtracurricularManagementPage';
import { SpiritualManagementPage } from './pages/admin/SpiritualManagementPage';
import { RulesManagementPage } from './pages/admin/RulesManagementPage';
import { StudentProvider } from './contexts/StudentContext';
import { VideoProvider } from './contexts/VideoContext';
import { VideoManagementPage } from './pages/admin/VideoManagementPage';

// Layout wrapper for public pages
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NewsProvider>
          <GalleryProvider>
            <SPMBProvider>
              <AcademicProvider>
                <ContentProvider>
                  <AchievementProvider>
                    <MessageProvider>
                      <DocumentProvider>
                        <StudentProvider>
                          <VideoProvider>
                            <Routes>
                              {/* Admin Routes - No Header/Footer */}
                              <Route path="/admin/login" element={<AdminLoginPage />} />
                              <Route path="/admin/dashboard" element={<DashboardPage />} />
                              <Route path="/admin/news" element={<NewsManagementPage />} />
                              <Route path="/admin/gallery" element={<GalleryManagementPage />} />
                              <Route path="/admin/spmb" element={<SPMBManagementPage />} />
                              <Route path="/admin/content" element={<ContentManagementPage />} />
                              <Route path="/admin/statistics" element={<StatisticsPage />} />
                              <Route path="/admin/achievements" element={<AchievementsManagementPage />} />
                              <Route path="/admin/documents" element={<DocumentsManagementPage />} />
                              <Route path="/admin/messages" element={<MessagesManagementPage />} />
                              <Route path="/admin/students" element={<StudentsManagementPage />} />
                              <Route path="/admin/logs" element={<ActivityLogManagementPage />} />
                              <Route path="/admin/academic" element={<AcademicManagementPage />} />
                              <Route path="/admin/org" element={<OrgStructureManagementPage />} />
                              <Route path="/admin/teachers" element={<TeacherStaffManagementPage />} />
                              <Route path="/admin/osis" element={<OsisManagementPage />} />
                              <Route path="/admin/extracurricular" element={<ExtracurricularManagementPage />} />
                              <Route path="/admin/spiritual" element={<SpiritualManagementPage />} />
                              <Route path="/admin/rules" element={<RulesManagementPage />} />
                              <Route path="/admin/videos" element={<VideoManagementPage />} />

                              {/* Public Routes - With Header/Footer */}
                              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                              <Route path="/profil" element={<PublicLayout><ProfilPage /></PublicLayout>} />
                              <Route path="/akademik" element={<PublicLayout><AkademikPage /></PublicLayout>} />
                              <Route path="/kesiswaan" element={<PublicLayout><KesiswaanPage /></PublicLayout>} />
                              <Route path="/berita" element={<PublicLayout><BeritaPage /></PublicLayout>} />
                              <Route path="/berita/:id" element={<PublicLayout><NewsDetailPage /></PublicLayout>} />
                              <Route path="/prestasi" element={<PublicLayout><PrestasiPage /></PublicLayout>} />
                              <Route path="/galeri" element={<PublicLayout><GaleriPage /></PublicLayout>} />
                              <Route path="/spmb" element={<PublicLayout><SPMBPage /></PublicLayout>} />
                              <Route path="/download" element={<PublicLayout><DownloadPage /></PublicLayout>} />
                              <Route path="/kontak" element={<PublicLayout><KontakPage /></PublicLayout>} />
                              <Route path="/profile" element={<PublicLayout><UserProfilePage /></PublicLayout>} />
                              <Route path="/login" element={<UserLoginPage />} />
                              <Route path="/register" element={<UserLoginPage />} />
                              <Route path="/reset-password" element={<ResetPasswordPage />} />

                              {/* Fallback Route */}
                              <Route path="*" element={<div className="flex items-center justify-center min-h-screen">404 - Page Not Found</div>} />
                            </Routes>
                          </VideoProvider>
                        </StudentProvider>
                      </DocumentProvider>
                    </MessageProvider>
                  </AchievementProvider>
                </ContentProvider>
              </AcademicProvider>
            </SPMBProvider>
          </GalleryProvider>
        </NewsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage'
import AuthOk from "@/pages/auth/AuthOk";

import Landing from '@/pages/public/Landing'
import Features from '@/pages/public/Features'
import About from '@/pages/public/About'
import Contact from '@/pages/public/Contact'
import Help from '@/pages/public/Help'
import Privacy from '@/pages/public/Privacy'
import Terms from '@/pages/public/Terms'

import FeedsList from '@/pages/feeds/FeedsList'
import NewFeed from '@/pages/feeds/NewFeed'
import FeedDetail from '@/pages/feeds/FeedDetail'
import EditFeed from '@/pages/feeds/EditFeed'

import CollectionsList from '@/pages/collections/CollectionsList'
import NewCollection from '@/pages/collections/NewCollection'
import CollectionDetail from '@/pages/collections/CollectionDetail'
import CollectionMembers from '@/pages/collections/CollectionMembers'

import ArticleReader from '@/pages/articles/ArticleReader'
import Saved from '@/pages/articles/Saved'
import Starred from '@/pages/articles/Starred'
import History from '@/pages/articles/History'

import Search from '@/pages/dashboard/Search'
import Notifications from '@/pages/dashboard/Notifications'

import Explore from '@/pages/dashboard/Explore'
import Chat from '@/pages/dashboard/Chat'
import Home from '@/pages/dashboard/Home'

import Profile from '@/pages/settings/Profile'
import SettingsProfile from '@/pages/settings/Index'
import SettingsAccount from '@/pages/settings/Account'
import SettingsSecurity from '@/pages/settings/Security'
import SettingsPreferences from '@/pages/settings/Preferences'
import SettingsNotif from '@/pages/settings/Notifications'
import SettingsIntegrations from '@/pages/settings/Integrations'
import SettingsApiKeys from '@/pages/settings/ApiKeys'

import NotFound from '@/pages/system/NotFound'
import Forbidden from '@/pages/system/Forbidden'
import ServerError from '@/pages/system/ServerError'
import Offline from "@/pages/system/Offline"
import AppErrorBoundary from "@/components/AppErrorBoundary";
import Onboarding from "@/pages/onboarding/Onboarding";
import ImportOPML from "@/pages/onboarding/ImportOPML";
import ExportOPML from "@/pages/onboarding/ExportOPML";


const App: React.FC = () => {
return (
    <AppErrorBoundary>
      <Routes>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
        <Route path="/auth-ok" element={<ProtectedRoute> <AuthOk /> </ProtectedRoute>} />

        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected */}
        <Route path="/app" element={ <ProtectedRoute> <Home /> </ProtectedRoute> } />

        <Route path="/feeds" element={<ProtectedRoute> <FeedsList /> </ProtectedRoute>} />
        <Route path="/feeds/new" element={<ProtectedRoute> <NewFeed /> </ProtectedRoute>} />
        <Route path="/feeds/:feedId" element={<ProtectedRoute> <FeedDetail /> </ProtectedRoute>} />
        <Route path="/feeds/:feedId/edit" element={<ProtectedRoute> <EditFeed /> </ProtectedRoute>} />

        <Route path="/collections" element={<ProtectedRoute> <CollectionsList /> </ProtectedRoute>} />
        <Route path="/collections/new" element={<ProtectedRoute> <NewCollection /> </ProtectedRoute>} />
        <Route path="/collections/:id" element={<ProtectedRoute> <CollectionDetail /> </ProtectedRoute>} />
        <Route path="/collections/:id/members" element={<ProtectedRoute> <CollectionMembers /> </ProtectedRoute>} />

        <Route path="/articles/:id" element={<ProtectedRoute> <ArticleReader /> </ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute> <Saved /> </ProtectedRoute>} />
        <Route path="/starred" element={<ProtectedRoute> <Starred /> </ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute> <History /> </ProtectedRoute>} />

        <Route path="/search" element={<ProtectedRoute> <Search /> </ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute> <Notifications /> </ProtectedRoute>} />

        <Route path="/explore" element={<ProtectedRoute> <Explore /> </ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute> <Chat /> </ProtectedRoute>} />

        <Route path="/me" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute> <SettingsProfile /> </ProtectedRoute>} />
        <Route path="account" element={<ProtectedRoute> <SettingsAccount /> </ProtectedRoute>} />
        <Route path="security" element={<ProtectedRoute> <SettingsSecurity /> </ProtectedRoute>} />
        <Route path="preferences" element={<ProtectedRoute> <SettingsPreferences /> </ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute> <SettingsNotif /> </ProtectedRoute>} />
        <Route path="integrations" element={<ProtectedRoute> <SettingsIntegrations /> </ProtectedRoute>} />
        <Route path="api" element={<ProtectedRoute> <SettingsApiKeys /> </ProtectedRoute>} />

        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/feeds/import" element={<ProtectedRoute><ImportOPML /></ProtectedRoute>} />
        <Route path="/feeds/export" element={<ProtectedRoute><ExportOPML /></ProtectedRoute>} />

        {/* Erreurs */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/401" element={<Offline />} />
      </Routes>
    </AppErrorBoundary>
);};

export default App;

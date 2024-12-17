import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { LastFmProvider } from '@/contexts/LastFmContext';
import AlbumDetails from '@/pages/AlbumDetails';
import Home from '@/pages/Home';
import LastFmDashboard from '@/pages/LastFmDashboard';
import Library from '@/pages/Library/index';
import Login from '@/pages/Login';
import PlaylistDetails from '@/pages/PlaylistDetails';
import Register from '@/pages/Register';
import Settings from '@/pages/Settings';
import SpotifyCallback from '@/pages/SpotifyCallback';
import TransferHistory from '@/pages/TransferHistory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <LastFmProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/spotify/callback" element={<SpotifyCallback />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/album/:id" element={<AlbumDetails />} />
                    <Route path="/playlist/:id" element={<PlaylistDetails />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/transfer-history" element={<TransferHistory />} />
                    <Route path="/lastfm" element={<LastFmDashboard />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </LastFmProvider>
          </AuthProvider>
        </Router>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

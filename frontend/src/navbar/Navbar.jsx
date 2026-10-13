import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  /* -------------------------
     TEMP: Local auth state
     (Replace with JWT /api/me)
  --------------------------*/
  useEffect(() => {
    // Safe fallback user (no Firebase)
    const mockUser = {
      name: 'User',
      email: 'user@example.com',
      role: 'seeker',
    };

    setUserName(mockUser.name);
    setUserEmail(mockUser.email);
    setUserRole(mockUser.role);
  }, []);

  const handleLogout = async () => {
    try {
      // Call backend logout route to clear JWT cookie
      await fetch('http://localhost:5000/api/user/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Frontend logout
      setUserName(null);
      setUserEmail(null);
      setUserRole(null);
      setLoggedOut(true);
    } catch (err) {
      console.error('Logout error:', err);
      // Still update frontend state even if backend call fails
      setUserName(null);
      setUserEmail(null);
      setUserRole(null);
      setLoggedOut(true);
    }
  };

  const handleClose = () => {
    setShowUserModal(false);
    setLoggedOut(false);
    navigate('/');
  };

  return (
    <nav className="relative sticky top-0 z-50 bg-white/75 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: brand + nav (desktop) */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-700">Her Hustle</Link>
            <nav className="hidden md:flex items-center space-x-4 text-gray-700">
              <Link to="/" className="py-2 px-3 rounded-md hover:bg-pink-50 transition">Home</Link>
              <Link to="/about" className="py-2 px-3 rounded-md hover:bg-pink-50 transition">About</Link>
              <Link to="/contact" className="py-2 px-3 rounded-md hover:bg-pink-50 transition">Contact</Link>
            </nav>
          </div>

          {/* Center spacer (search removed) */}
          <div className="hidden md:block flex-1" />

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            {userName && location.pathname !== '/' && !loggedOut ? (
              <button
                onClick={() => setShowUserModal((s) => !s)}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-100 transition"
                aria-haspopup="menu"
                aria-expanded={showUserModal}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                  {userName?.charAt(0)?.toUpperCase() || <FaUserCircle />}
                </div>
                <span className="hidden lg:inline text-sm">{userName}</span>
              </button>
            ) : (
              <Link to="/login" className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-500 transition">Login</Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel - slide down */}
      <div className={`md:hidden bg-white border-b border-gray-100 transition-all ${menuOpen ? 'max-h-screen shadow-md' : 'max-h-0 overflow-hidden'}`}>
        <div className="px-4 pb-4">
          <div className="flex flex-col gap-3 pt-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-md hover:bg-gray-50">Home</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-md hover:bg-gray-50">About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-md hover:bg-gray-50">Contact</Link>

            {userName && location.pathname !== '/' && !loggedOut ? (
              <button
                onClick={() => { setShowUserModal(true); setMenuOpen(false); }}
                className="mt-2 py-2 px-3 rounded-md bg-pink-50 text-pink-600 border border-pink-100"
              >
                Logged in as {userName}
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2 py-2 px-3 rounded-md bg-pink-600 text-white font-semibold text-center">Login</Link>
            )}
          </div>
        </div>
      </div>

      {/* User dropdown / status */}
      {showUserModal ? (
        !loggedOut ? (
          <div className="absolute right-4 top-16 bg-white rounded-xl shadow-lg border border-gray-100 w-56 py-2 z-50">
            <div className="px-4 py-2 text-sm text-gray-700">
              <div className="font-semibold text-pink-600">{userName}</div>
              <div className="text-xs text-gray-400">{userEmail}</div>
            </div>
            <div className="border-t border-gray-100 mt-2 pt-2 px-2">
              <Link to="/profile" className="block px-3 py-2 rounded hover:bg-gray-50">My Profile</Link>
              <Link to="/applications" className="block px-3 py-2 rounded hover:bg-gray-50">My Applications</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-gray-50">Logout</button>
            </div>
          </div>
        ) : (
          <div className="absolute right-4 top-16 bg-white rounded-xl shadow-lg border border-gray-100 w-56 py-2 z-50">
            <div className="px-4 py-3 text-sm">
              <div className="font-semibold text-pink-600 mb-1">Logged Out</div>
              <div className="text-gray-600">You are logged out.</div>
              <div className="mt-3 text-right">
                <button className="px-3 py-1 rounded-md bg-pink-600 text-white text-sm" onClick={() => { setShowUserModal(false); navigate('/'); }}>Close</button>
              </div>
            </div>
          </div>
        )
      ) : null}
    </nav>
  );
}

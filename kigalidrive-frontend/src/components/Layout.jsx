import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, showSidebar = true }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div>
            <Navbar />
            {isAuthenticated && showSidebar ? (
                <>
                    <Sidebar />
                    <main className="main-content">{children}</main>
                </>
            ) : (
                <main style={{ marginTop: '70px' }}>{children}</main>
            )}
        </div>
    );
};

export default Layout;

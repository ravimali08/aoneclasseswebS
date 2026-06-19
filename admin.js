// AONE Classes Anjar - Admin Panel Controller
const supabaseUrl = 'https://sgvaqjmlvqwjiczpulfc.supabase.co';
const supabaseKey = 'sb_publishable_Xvt1CBVQ8Y9cSzhRoG9j7Q_hjBOFkTO';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginCard = document.getElementById('loginCard');
  const dashboardPanel = document.getElementById('dashboardPanel');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const inquiriesTableBody = document.getElementById('inquiriesTableBody');
  const searchInput = document.getElementById('searchInput');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutBtnHeader = document.getElementById('logoutBtnHeader');
  
  const statTotalInquiries = document.getElementById('statTotalInquiries');
  const statSpokenEnglish = document.getElementById('statSpokenEnglish');
  const statCommerce = document.getElementById('statCommerce');

  let inquiriesData = [];

  // Check login state
  const checkAuthState = () => {
    const session = localStorage.getItem('supabase_admin_session');
    if (session) {
      const sessionData = JSON.parse(session);
      // Basic check if token exists
      if (sessionData && sessionData.access_token) {
        showDashboard(sessionData.access_token);
        return;
      }
    }
    showLogin();
  };

  const showLogin = () => {
    loginCard.style.display = 'block';
    dashboardPanel.style.display = 'none';
    if (logoutBtnHeader) logoutBtnHeader.style.display = 'none';
  };

  const showDashboard = (accessToken) => {
    loginCard.style.display = 'none';
    dashboardPanel.style.display = 'flex';
    if (logoutBtnHeader) logoutBtnHeader.style.display = 'block';
    fetchInquiries(accessToken);
  };

  // Login handler
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const loginBtn = document.getElementById('loginBtn');

      try {
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Logging in... <i class="fa-solid fa-spinner fa-spin"></i>';

        // Sign in using Supabase Auth REST API
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error_description || data.message || 'Authentication failed');
        }

        // Save session
        localStorage.setItem('supabase_admin_session', JSON.stringify({
          access_token: data.access_token,
          user: data.user
        }));

        showDashboard(data.access_token);
      } catch (error) {
        alert('Login Error: ' + error.message);
      } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Secure Login <i class="fa-solid fa-lock" style="margin-left: 0.5rem;"></i>';
      }
    });
  }

  // Fetch data
  const fetchInquiries = async (accessToken) => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/inquiries?order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Range': '0-99' // Limits to latest 100 rows
        }
      });

      if (response.status === 401 || response.status === 403) {
        // Token expired
        handleLogout();
        alert('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load database records');
      }

      inquiriesData = await response.json();
      renderTable(inquiriesData);
      updateStats(inquiriesData);

    } catch (error) {
      inquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem; color: var(--color-cta);">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
            Error: ${error.message}
          </td>
        </tr>
      `;
    }
  };

  // Render inquiries
  const renderTable = (data) => {
    if (!data.length) {
      inquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem; color: var(--color-text-sub);">
            No student inquiries found in database.
          </td>
        </tr>
      `;
      return;
    }

    inquiriesTableBody.innerHTML = data.map(item => {
      // Format Date
      const date = new Date(item.created_at);
      const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Format Course Badge
      const isCommerce = item.course && (item.course.includes('Commerce') || item.course.includes('B.Com'));
      const badgeClass = isCommerce ? 'badge-course commerce' : 'badge-course';

      return `
        <tr>
          <td style="font-size: 0.85rem; color: var(--color-text-sub); white-space: nowrap;">${formattedDate}</td>
          <td style="font-weight: 600; color: var(--color-text-main);">${escapeHTML(item.name)}</td>
          <td><a href="tel:${item.phone}" style="color: var(--color-secondary); font-weight: 500;">${escapeHTML(item.phone)}</a></td>
          <td><span class="${badgeClass}">${escapeHTML(item.course || 'Spoken English')}</span></td>
          <td style="font-size: 0.9rem; color: var(--color-text-sub); max-width: 300px; word-wrap: break-word;">${escapeHTML(item.message || '-')}</td>
        </tr>
      `;
    }).join('');
  };

  // Update stat cards
  const updateStats = (data) => {
    statTotalInquiries.textContent = data.length;
    
    const spoken = data.filter(item => item.course && item.course.toLowerCase().includes('spoken')).length;
    statSpokenEnglish.textContent = spoken;
    
    const commerce = data.filter(item => item.course && (item.course.toLowerCase().includes('commerce') || item.course.toLowerCase().includes('b.com'))).length;
    statCommerce.textContent = commerce;
  };

  // Helper to escape HTML tags
  const escapeHTML = (str) => {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  };

  // Real-time Search Filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      const filtered = inquiriesData.filter(item => {
        const name = (item.name || '').toLowerCase();
        const phone = (item.phone || '').toLowerCase();
        const course = (item.course || '').toLowerCase();
        const msg = (item.message || '').toLowerCase();
        return name.includes(val) || phone.includes(val) || course.includes(val) || msg.includes(val);
      });
      renderTable(filtered);
    });
  }

  // Export CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (!inquiriesData.length) {
        alert('No data available to export.');
        return;
      }

      let csv = 'Date & Time,Student Name,Mobile Number,Course,Message\n';
      
      inquiriesData.forEach(item => {
        const date = new Date(item.created_at).toLocaleString('en-IN');
        const name = `"${(item.name || '').replace(/"/g, '""')}"`;
        const phone = `"${(item.phone || '').replace(/"/g, '""')}"`;
        const course = `"${(item.course || '').replace(/"/g, '""')}"`;
        const message = `"${(item.message || '').replace(/"/g, '""')}"`;
        
        csv += `${date},${name},${phone},${course},${message}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `aone_classes_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('supabase_admin_session');
    showLogin();
  };

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (logoutBtnHeader) logoutBtnHeader.addEventListener('click', handleLogout);

  // Initialize Auth Check
  checkAuthState();
});

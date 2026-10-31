import React, { useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  X,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const formatAlumniRecord = (item, index = 1) => {
  // If already formatted by API
  if (item.name_of_student && item.current_details !== undefined && item.pass_out_batch !== undefined) {
    return {
      ...item,
      sr_no: index,
    };
  }

  // Pass-Out Batch
  let batch = item.a_batch || '';
  if (!batch && item.a_graduation_year) {
    batch = `${item.a_graduation_year - 4}-${item.a_graduation_year}`;
  }
  if (!batch) batch = 'N/A';

  // Name
  const name = [item.a_fname, item.a_lname].filter(Boolean).join(' ').trim() || item.email || 'Alumni';

  // AUID
  const auid = item.a_auid || item.a_alumni_id || (item.id ? `AU-${item.id}` : 'N/A');

  // Degree Level (UG / PG / PhD)
  let level = 'UG';
  const deg = (item.a_degree || item.degree || '').toUpperCase();
  if (/PH\.?D|DOCTOR/.test(deg)) {
    level = 'PhD';
  } else if (/M\.SC|M\.TECH|MASTER|MBA|MCA|MA\b|M\.COM/.test(deg)) {
    level = 'PG';
  } else if (/B\.TECH|B\.SC|BACHELOR|BBA|BCA|BA\b|B\.COM/.test(deg)) {
    level = 'UG';
  }

  // Gender
  let gender = item.a_gender || item.gender || '';
  if (!gender) {
    if (/kaur/i.test(name)) gender = 'Female';
    else if (/singh/i.test(name)) gender = 'Male';
    else gender = 'Other';
  }

  // Current Status & Current Details
  const rawStatus = item.a_current_status || item.current_status || '';
  let statusLabel = 'Job';
  let details = '-';

  if (rawStatus === 'job' || (!rawStatus && (item.a_company || item.a_job_org))) {
    statusLabel = 'Job';
    const desig = item.a_job_desig || item.a_designation || '';
    const org = item.a_job_org || item.a_company || '';
    const loc = item.a_job_loc || item.a_city || '';
    const jType = item.a_job_type ? (item.a_job_type.charAt(0).toUpperCase() + item.a_job_type.slice(1) + ' Job') : '';
    const parts = [];
    if (desig) parts.push(desig);
    if (org) parts.push(`at ${org}`);
    if (loc) parts.push(`(${loc})`);
    if (jType) parts.push(`[${jType}]`);
    details = parts.join(' ') || 'Employed';
  } else if (rawStatus === 'higher_study') {
    statusLabel = 'Higher Studies';
    const course = item.a_study_course || '';
    const inst = item.a_study_institution || '';
    const loc = item.a_study_location || '';
    const parts = [];
    if (course) parts.push(`Course: ${course}`);
    if (inst) parts.push(`at ${inst}`);
    if (loc) parts.push(`(${loc})`);
    details = parts.join(' ') || 'Pursuing Higher Studies';
  } else if (rawStatus === 'other') {
    statusLabel = 'Other';
    details = item.a_industry || item.a_admin_notes || 'Self-Employed / Other';
  } else {
    statusLabel = 'Alumni';
    details = item.a_company || item.a_admin_notes || '-';
  }

  return {
    sr_no: index,
    pass_out_batch: batch,
    department: item.a_department || item.department || 'General',
    auid: auid,
    name_of_student: name,
    degree_level: level,
    gender: gender,
    mobile_student: item.a_phone || item.phone || '',
    email_address: item.email || '',
    current_status: statusLabel,
    current_details: details,
    raw_status: rawStatus,
    user_id: item.id || item.user_id,
  };
};

export const sortBatchesDescending = (list) => {
  const getSortYear = (item) => {
    const batchStr = item.pass_out_batch || item.a_batch || (item.a_graduation_year ? String(item.a_graduation_year) : '');
    const matches = String(batchStr).match(/\d{4}/g);
    if (!matches || matches.length === 0) return 0;
    return parseInt(matches[matches.length - 1], 10);
  };

  return [...list].sort((a, b) => {
    const yearA = getSortYear(a);
    const yearB = getSortYear(b);
    if (yearA !== yearB) return yearB - yearA; // Descending (2024, 2022, 2020...)
    const batchA = a.pass_out_batch || a.a_batch || '';
    const batchB = b.pass_out_batch || b.a_batch || '';
    return String(batchB).localeCompare(String(batchA));
  });
};

export const downloadAlumniCsv = (formattedRows, filenamePrefix = 'Akal_Alumni_Report') => {
  if (!formattedRows || formattedRows.length === 0) return false;

  const headers = [
    'Pass-Out Batch',
    'Sr. No.',
    'Department',
    'AUID',
    'Name of Student',
    'UG/PG/PhD',
    'Gender',
    'Mobile Student',
    'Email Address',
    'Current Status',
    'Details of the Current JOB/Institute Details',
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const rows = formattedRows.map((item, index) => [
    escapeCsv(item.pass_out_batch),
    escapeCsv(index + 1), // Strict sequential Sr. No. in batch descending view
    escapeCsv(item.department),
    escapeCsv(item.auid),
    escapeCsv(item.name_of_student),
    escapeCsv(item.degree_level),
    escapeCsv(item.gender),
    escapeCsv(item.mobile_student),
    escapeCsv(item.email_address),
    escapeCsv(item.current_status),
    escapeCsv(item.current_details),
  ].join(','));

  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

const AlumniReportModal = ({
  isOpen,
  onClose,
  showToast,
  sourceRecords = [],
  activeFilters = [],
  filePrefix = '',
}) => {
  // Sort source records strictly in batch-wise descending order and format them
  const processedData = useMemo(() => {
    const sorted = sortBatchesDescending(sourceRecords || []);
    return sorted.map((item, index) => formatAlumniRecord(item, index + 1));
  }, [sourceRecords]);

  // Compute a descriptive filename based on the applied filters
  const computedPrefix = useMemo(() => {
    if (filePrefix) return filePrefix;
    if (activeFilters && activeFilters.length > 0) {
      const cleanParts = activeFilters
        .map((f) =>
          f
            .replace(/[:"']/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_-]/g, '')
        )
        .filter(Boolean);
      return cleanParts.length > 0 ? `Akal_Alumni_Report_${cleanParts.join('_')}` : 'Akal_Alumni_Report';
    }
    return 'Akal_Alumni_Report_All';
  }, [filePrefix, activeFilters]);

  const handleDownload = () => {
    if (processedData.length === 0) {
      if (showToast) showToast('No alumni records match the active filters to export');
      return;
    }
    const success = downloadAlumniCsv(processedData, computedPrefix);
    if (success && showToast) {
      showToast(`Exported ${processedData.length} records to ${computedPrefix}_${new Date().toISOString().slice(0, 10)}.csv!`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-fullscreen-xl-down modal-xl modal-dialog-scrollable" style={{ maxWidth: '97vw' }}>
        <div className="modal-content shadow-lg border-0 rounded-3">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-bottom py-3 px-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="p-2 rounded-3 bg-success bg-opacity-25 text-success d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px' }}
              >
                <FileSpreadsheet size={24} className="text-success" />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white d-flex align-items-center gap-2 flex-wrap">
                  Alumni Data Report Preview
                  <span className="badge bg-success-subtle text-success border border-success-subtle fs-6 py-1 px-2">
                    Batch-wise Descending Order ⬇️
                  </span>
                  <span className="badge bg-primary text-white rounded-pill px-2 py-1 fs-7">
                    {processedData.length} Records Matching Page Filters
                  </span>
                </h5>
                <p className="text-light text-opacity-75 small mb-0">
                  Generated directly using your active filters on the Manage Alumni page. No separate filters needed.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            />
          </div>

          {/* Active Filters Summary Bar */}
          <div className="bg-light border-bottom px-4 py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2 flex-wrap small">
              <span className="fw-bold text-muted d-flex align-items-center gap-1">
                <Filter size={13} /> Active Page Filters:
              </span>
              {activeFilters && activeFilters.length > 0 ? (
                activeFilters.map((f, i) => (
                  <span key={i} className="badge bg-white text-dark border shadow-xs px-2 py-1">
                    {f}
                  </span>
                ))
              ) : (
                <span className="badge bg-white text-muted border px-2 py-1">All Alumni (No filter applied)</span>
              )}
              <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">
                Sorted: Pass-Out Batch Descending (Newest First)
              </span>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-success fw-bold d-flex align-items-center gap-2 shadow-sm px-3"
              onClick={handleDownload}
              disabled={processedData.length === 0}
            >
              <Download size={15} /> Download CSV ({processedData.length})
            </button>
          </div>

          {/* Table Container */}
          <div className="modal-body p-0" style={{ maxHeight: 'calc(80vh - 160px)', overflowY: 'auto' }}>
            {processedData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Filter size={38} className="text-muted opacity-50 mb-2" />
                <h6 className="fw-bold">No alumni records match the active filters on the page</h6>
                <p className="small mb-0">Change the dropdown filters on the Manage Alumni page and click Generate Report again.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle small mb-0">
                  <thead className="table-dark sticky-top text-nowrap" style={{ zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '120px' }}>Pass-Out Batch ⬇️</th>
                      <th style={{ width: '60px' }} className="text-center">Sr. No.</th>
                      <th>Department</th>
                      <th style={{ width: '120px' }}>AUID</th>
                      <th>Name of Student</th>
                      <th style={{ width: '80px' }} className="text-center">UG/PG/PhD</th>
                      <th style={{ width: '80px' }}>Gender</th>
                      <th>Mobile Student</th>
                      <th>Email Address</th>
                      <th style={{ width: '120px' }}>Current Status</th>
                      <th style={{ minWidth: '260px' }}>Details of the Current JOB/Institute Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((item, idx) => (
                      <tr key={item.user_id || idx}>
                        {/* 1. Pass-Out Batch */}
                        <td className="fw-semibold font-monospace text-nowrap">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                            {item.pass_out_batch || 'N/A'}
                          </span>
                        </td>

                        {/* 2. Sr. No. */}
                        <td className="text-center fw-bold text-muted">{idx + 1}</td>

                        {/* 3. Department */}
                        <td className="fw-semibold text-dark">{item.department}</td>

                        {/* 4. AUID */}
                        <td className="font-monospace text-nowrap">
                          <span className="badge bg-secondary-subtle text-dark border border-secondary-subtle px-2 py-1">
                            {item.auid}
                          </span>
                        </td>

                        {/* 5. Name of Student */}
                        <td className="fw-bold text-primary">{item.name_of_student}</td>

                        {/* 6. UG/PG/PhD */}
                        <td className="text-center">
                          <span
                            className={`badge px-2 py-1 ${
                              item.degree_level === 'PhD'
                                ? 'bg-danger-subtle text-danger border border-danger-subtle'
                                : item.degree_level === 'PG'
                                ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                                : 'bg-info-subtle text-info-emphasis border border-info-subtle'
                            }`}
                          >
                            {item.degree_level || 'UG'}
                          </span>
                        </td>

                        {/* 7. Gender */}
                        <td>
                          <span
                            className={`badge ${
                              item.gender === 'Female'
                                ? 'bg-danger-subtle text-danger'
                                : item.gender === 'Male'
                                ? 'bg-info-subtle text-info-emphasis'
                                : 'bg-light text-muted border'
                            }`}
                          >
                            {item.gender || '-'}
                          </span>
                        </td>

                        {/* 8. Mobile Student */}
                        <td className="font-monospace text-nowrap">
                          {item.mobile_student ? (
                            <a
                              href={`tel:${item.mobile_student}`}
                              className="text-decoration-none text-dark"
                            >
                              {item.mobile_student}
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>

                        {/* 9. Email Address */}
                        <td className="font-monospace text-nowrap">
                          {item.email_address ? (
                            <a
                              href={`mailto:${item.email_address}`}
                              className="text-decoration-none text-primary"
                            >
                              {item.email_address}
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>

                        {/* 10. Current Status */}
                        <td>
                          <span
                            className={`badge px-2 py-1 ${
                              item.current_status === 'Job'
                                ? 'bg-success text-white'
                                : item.current_status === 'Higher Studies'
                                ? 'bg-primary text-white'
                                : 'bg-secondary text-white'
                            }`}
                          >
                            {item.current_status}
                          </span>
                        </td>

                        {/* 11. Details of the Current JOB/Institute Details */}
                        <td className="text-break" style={{ maxWidth: '340px' }}>
                          <span className="text-secondary small fw-medium">
                            {item.current_details || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-top py-2 px-3 d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Official format: <strong>Pass-Out Batch, Sr. No., Department, AUID, Name of Student, UG/PG/PhD, Gender, Mobile Student, Email Address, Current Status, Details of the Current JOB/Institute Details</strong>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-dark"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-sm btn-success fw-bold d-flex align-items-center gap-1 shadow-sm px-3"
                onClick={handleDownload}
                disabled={processedData.length === 0}
              >
                <Download size={14} /> Download CSV in Batch Descending Order ({processedData.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniReportModal;

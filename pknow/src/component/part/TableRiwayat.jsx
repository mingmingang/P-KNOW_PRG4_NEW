import React, { useState } from 'react';
import '../../style/Table.css'; // Import CSS for styling
import Konfirmasi from '../part/Konfirmasi';
import { FaTrash } from 'react-icons/fa';

const Table = ({ tableHead, tableData }) => {
    // State for managing the confirmation modal
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Display 10 rows per page
    const totalPages = Math.ceil(tableData.length / rowsPerPage);

    // Get data for the current page
    const currentData = tableData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Show confirmation modal
    const handleDeleteClick = (rowIndex) => {
        setSelectedRow(rowIndex);
        setShowConfirmation(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirm = () => {
        if (selectedRow !== null) {
            // Remove the selected row
            const newData = [...tableData];
            newData.splice(selectedRow, 1); // Remove row at the selected index
            // Update the data (in a real app, you'd also handle this in your backend)
            setSelectedRow(null);
            setShowConfirmation(false);
            // After deletion, you may want to update the table with new data.
            // In a real scenario, you'd call setTableData(newData) or send the update to the backend.
        }
    };

    // Cancel delete action
    const handleDeleteCancel = () => {
        setSelectedRow(null);
        setShowConfirmation(false);
    };

    return (
        <div className="table-container">
            <table className="dynamic-table">
                <thead>
                    <tr>
                        {tableHead.map((head, index) => (
                            <th key={index}>{head}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {/* Automatically generate row number */}
                            <td>{(currentPage - 1) * rowsPerPage + rowIndex + 1}</td>
                            {row.map((cell, cellIndex) => {
                                if (tableHead[cellIndex + 1] === "Lampiran") {
                                    // Display download links in the Lampiran column
                                    return (
                                        <td key={cellIndex}>
                                            <a href={cell.url} download={cell.name} style={{textDecoration:'none',color:'white',fontWeight:'500', backgroundColor:'#0A5EA8', padding:'5px 10px', borderRadius:'10px'}}>
                                                {cell.name}
                                            </a>
                                        </td>
                                    );
                                } else if (tableHead[cellIndex + 1] === "Aksi") {
                                    // Display trash icon in the Aksi column
                                    return (
                                        <td key={cellIndex}>
                                            <FaTrash
                                                className="trash-icon"
                                                onClick={() => handleDeleteClick((currentPage - 1) * rowsPerPage + rowIndex)}
                                            />
                                        </td>
                                    );
                                } else {
                                    return <td key={cellIndex}>{cell}</td>;
                                }
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <Konfirmasi
                    title="Konfirmasi Penghapusan"
                    pesan="Apakah Anda yakin ingin menghapus riwayat pengajuan ini?"
                    onYes={handleDeleteConfirm}
                    onNo={handleDeleteCancel}
                />
            )}
        </div>
    );
};

export default Table;

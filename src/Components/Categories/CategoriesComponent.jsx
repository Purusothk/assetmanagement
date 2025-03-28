import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/CategoryService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { FaSun, FaMoon } from "react-icons/fa"; // Importing icons

const CategoriesComponent =   () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [theme, setTheme] = useState("light"); // Theme state
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const token = Cookies.get("token");
  let decoded = null;
  if (token) {
    decoded = jwtDecode(token);
  }

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const categoriesArray = data.$values || [];
      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory) {
      setErrorMessage("Category name is required!");
      return;
    }
    try {
      await createCategory({ categoryName: newCategory });
      fetchCategories();
      setNewCategory("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCategoryName) {
      setErrorMessage("Please provide a valid category name");
      return;
    }
    try {
      await updateCategory(id, { categoryName: editingCategoryName });
      setEditingCategoryId(null);
      fetchCategories();
      setErrorMessage("");
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const enableEditing = (id, name) => {
    setEditingCategoryId(id);
    setEditingCategoryName(name);
  };
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
   

  return (
    <div style={theme === "light" ? styles.lightContainer : styles.darkContainer}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>
      <div style={styles.themeIcon} onClick={toggleTheme}>
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </div>
      <div style={styles.userRoleBar}>
        {decoded ? (
          <div style={styles.userRole}>User Role: <span style={styles.roleText}>{decoded.role}</span></div>
        ) : (
          <div style={styles.userRole}>No user role found</div>
        )}
      </div>

      {decoded?.role === "Admin" && (
        <div style={styles.formWrapper}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category name"
            style={styles.input}
          />
          <button style={styles.submitButton} onClick={handleCreateCategory}>
            Submit New Category
          </button>
        </div>
      )}
      {errorMessage && <div style={styles.error}>{errorMessage}</div>}
      <h1 style={styles.heading}>Categories List</h1>
      {categories && categories.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Category Name</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.categoryId} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  {editingCategoryId === category.categoryId ? (
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      style={styles.input}
                    />
                  ) : (
                    category.categoryName
                  )}
                </td>
                <td style={styles.tableCell}>
                  {decoded?.role === "Admin" && (
                    <>
                      {editingCategoryId === category.categoryId ? (
                        <>
                          <button
                            style={styles.actionButton}
                            onClick={() => handleUpdateCategory(category.categoryId)}
                          >
                            Save
                          </button>
                          <button
                            style={styles.actionButton}
                            onClick={() => setEditingCategoryId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={styles.actionButton}
                            onClick={() => enableEditing(category.categoryId, category.categoryName)}
                          >
                            Update
                          </button>
                          <button
                            style={styles.actionButton}
                            onClick={() => handleDeleteCategory(category.categoryId)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={styles.noCategories}>No categories available</p>
      )}
      <footer style={theme === "light" ? styles.lightFooter : styles.darkFooter}>
        <p style={styles.footerText}>Powered by Your Company © 2024</p>
      </footer>
    </div>
  );
};

const styles = {
  lightContainer: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    // backgroundColor: "#f0f8ff", // Light Alice Blue
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    color: "#000",
    minHeight: "100vh",
    minWidth :"100vh",
    justifyContent: "space-between", // Added to push footer to bottom
  },
  darkContainer: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#333", // Dark background
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    color: "#fff",
    minHeight: "100vh",
    minWidth :"100vh",
    justifyContent: "space-between", // Added to push footer to bottom
  },
  backButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#007bff", // Blue color
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  themeIcon: {
    position: "absolute",
    top: "50px",
    right: "10px",
    cursor: "pointer",
    fontSize: "24px",
  },
  userRoleBar: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 20px",
    width: "30%",
    textAlign: "center",
    marginBottom: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  userRole: {
    marginBottom: "3px",
    fontSize: "18px",
  },
  formWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
    width: "70%",
  },
  input: {
    padding: "12px",
    margin: "8px 10px 8px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#ffffff", // White background for inputs
    color: "#000", // Black text color for input
    fontSize: "14px",
    flex: "1",
  },
  submitButton: {
    backgroundColor: "#007bff", // Blue color
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: "14px",
    margin: "10px 0",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "inherit", // inherit the color from the container
    fontSize: "24px",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    // marginTop: "2px",
    borderCollapse: "collapse",
    color: "inherit", // inherit the color from the container
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "left",
    padding: "12px",
    fontWeight: "bold",
  },
  tableCell: {
    padding: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    color: "#000",
  },
  tableRow: {
    textAlign: "left",
    color: "#000",
  },
  actionButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "8px 16px",
    margin: "5px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "'Arial', sans-serif",
    fontWeight: "bold",
  },
  noCategories: {
    fontSize: "18px",
    color: "#333",
  },
  footerText: {
    fontSize: "16px",
    color: "#000",
  },
  lightFooter: {
    backgroundColor: "#f0f8ff",
    color: "#000",
    padding: "10px",
    textAlign: "center",
    width: "100%",
  },
  darkFooter: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "10px",
    textAlign: "center",
    width: "100%",
  },
  roleText: {
    fontWeight: "bold",
  },
};

export default CategoriesComponent;

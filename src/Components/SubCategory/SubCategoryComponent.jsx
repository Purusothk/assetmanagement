import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../services/SubCategoryService";
import { getCategories } from "../../services/CategoryService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { FaSun, FaMoon } from "react-icons/fa"; // Importing icons

const SubCategoryComponent = () => {
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newSubCategory, setNewSubCategory] = useState({
    subCategoryName: "",
    quantity: 0,
    categoryId: "",
  });
  const [editingSubCategoryId, setEditingSubCategoryId] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState({
    subCategoryName: "",
    quantity: 0,
    categoryId: "",
  });
  const [theme, setTheme] = useState("light");
  const [errorMessage, setErrorMessage] = useState("");

  const token = Cookies.get("token");
  let decoded = null;
  if (token) {
    decoded = jwtDecode(token);
  }

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const data = await getSubCategories();
      const subCategoriesArray = data.$values || data;
      setSubCategories(subCategoriesArray);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const categoriesArray = data.$values || data;
      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryId === categoryId);
    return category ? category.categoryName : "N/A";
  };

  const handleCreateSubCategory = async () => {
    if (!newSubCategory.subCategoryName || newSubCategory.quantity <= 0 || !newSubCategory.categoryId) {
      setErrorMessage("Please provide a valid subcategory name, quantity, and category.");
      return;
    }

    try {
      const subCategoryData = {
        subCategoryName: newSubCategory.subCategoryName,
        quantity: newSubCategory.quantity,
        categoryId: newSubCategory.categoryId,
      };
      await createSubCategory(subCategoryData);
      fetchSubCategories();
      setNewSubCategory({ subCategoryName: "", quantity: 0, categoryId: "" });
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating subcategory:", error);
    }
  };

  const handleUpdateSubCategory = async (id) => {
    if (!editingSubCategory.subCategoryName || editingSubCategory.quantity <= 0 || !editingSubCategory.categoryId) {
      setErrorMessage("Please provide a valid subcategory name, quantity, and category.");
      return;
    }

    try {
      await updateSubCategory(id, editingSubCategory);
      setEditingSubCategoryId(null);
      fetchSubCategories();
      setErrorMessage("");
    } catch (error) {
      console.error("Error updating subcategory:", error);
    }
  };

  const handleDeleteSubCategory = async (id) => {
    try {
      await deleteSubCategory(id);
      fetchSubCategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  const enableEditing = (id, subCategoryName, quantity, categoryId) => {
    setEditingSubCategoryId(id);
    setEditingSubCategory({ subCategoryName, quantity, categoryId });
  };

  const handleInputChange = (e, setFunction) => {
    const { name, value } = e.target;
    setFunction((prevState) => ({
      ...prevState,
      [name]: name === "quantity" ? parseInt(value, 10) : value,
    }));
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div style={theme === "light" ? styles.lightContainer : styles.darkContainer}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>
      <div style={styles.themeIcon} onClick={toggleTheme}>
        {/* {theme === "light" ? <FaMoon /> : <FaSun />} */}
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
            name="subCategoryName"
            value={newSubCategory.subCategoryName}
            onChange={(e) => handleInputChange(e, setNewSubCategory)}
            placeholder="Enter new subcategory name"
            style={styles.input}
          />
          <input
            type="number"
            name="quantity"
            value={newSubCategory.quantity}
            onChange={(e) => handleInputChange(e, setNewSubCategory)}
            placeholder="Enter quantity"
            style={styles.input}
          />
          <select
            name="categoryId"
            value={newSubCategory.categoryId}
            onChange={(e) => handleInputChange(e, setNewSubCategory)}
            style={styles.select}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
          <button style={styles.submitButton} onClick={handleCreateSubCategory}>
            Submit New SubCategory
          </button>
        </div>
      )}
      {errorMessage && <div style={styles.error}>{errorMessage}</div>}
      <h1 style={styles.heading}>SubCategories List</h1>
      {subCategories && subCategories.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>SubCategory Name</th>
              <th style={styles.tableHeader}>Quantity</th>
              <th style={styles.tableHeader}>Category</th>
              {decoded?.role === "Admin" && <th style={styles.tableHeader}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {subCategories.map((subCategory) => (
              <tr key={subCategory.subCategoryId} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  {editingSubCategoryId === subCategory.subCategoryId ? (
                    <input
                      type="text"
                      name="subCategoryName"
                      value={editingSubCategory.subCategoryName}
                      onChange={(e) => handleInputChange(e, setEditingSubCategory)}
                      style={styles.input}
                    />
                  ) : (
                    subCategory.subCategoryName
                  )}
                </td>
                <td style={styles.tableCell}>
                  {editingSubCategoryId === subCategory.subCategoryId ? (
                    <input
                      type="number"
                      name="quantity"
                      value={editingSubCategory.quantity}
                      onChange={(e) => handleInputChange(e, setEditingSubCategory)}
                      style={styles.input}
                    />
                  ) : (
                    subCategory.quantity
                  )}
                </td>
                <td style={styles.tableCell}>
                  {editingSubCategoryId === subCategory.subCategoryId ? (
                    <select
                      name="categoryId"
                      value={editingSubCategory.categoryId}
                      onChange={(e) => handleInputChange(e, setEditingSubCategory)}
                      style={styles.select}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    getCategoryName(subCategory.categoryId)
                  )}
                </td>
                {decoded?.role === "Admin" && (
                  <td style={styles.tableCell}>
                    <>
                      {editingSubCategoryId === subCategory.subCategoryId ? (
                        <>
                          <button
                            style={styles.actionButton}
                            onClick={() => handleUpdateSubCategory(subCategory.subCategoryId)}
                          >
                            Save
                          </button>
                          <button
                            style={styles.actionButton}
                            onClick={() => setEditingSubCategoryId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={styles.actionButton}
                            onClick={() =>
                              enableEditing(
                                subCategory.subCategoryId,
                                subCategory.subCategoryName,
                                subCategory.quantity,
                                subCategory.categoryId
                              )
                            }
                          >
                            Update
                          </button>
                          <button
                            style={styles.actionButton}
                            onClick={() => handleDeleteSubCategory(subCategory.subCategoryId)}
                            >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={styles.noSubCategories}>No subcategories available</p>
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
    justifyContent: "space-between", // To push footer to the bottom
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
    justifyContent: "space-between", // To push footer to the bottom
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
    marginBottom: "1px",
    fontSize: "18px",
  },
  formWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
    width: "150%",
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
  select: {
    padding: "12px",
    margin: "8px 10px 8px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#ffffff", // White background for select
    color: "#000", // Black text color for select
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
    marginTop: "20px",
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
  noSubCategories: {
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



export default SubCategoryComponent;


// Update the entire product list
function updateProductList(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return; // Only run on index.html
  productList.innerHTML = ''; // Clear the list
  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.classList.add('product');
    if (isExpiringSoon(product.expiryDate)) {
      productDiv.classList.add('expiring');
    }
    productDiv.innerHTML = `
      <h3>${product.name}${isExpiringSoon(product.expiryDate) ? ' <span class="warning-icon">⚠️</span>' : ''}</h3>
      <p><strong>ID:</strong> ${product.id}</p>
      <p><strong>Price:</strong> $${product.price}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <p><strong>Weight:</strong> ${product.weight}</p>
      <p><strong>Protein:</strong> ${product.protein}</p>
      <p><strong>Vitamins:</strong> ${product.vitamins}</p>
      <p><strong>Manufacturing Date:</strong> ${product.manufacturingDate}</p>
      <p><strong>Expiry Date:</strong> ${product.expiryDate}</p>
    `;
    productList.appendChild(productDiv);
  });
  // Update local storage
  localStorage.setItem('products', JSON.stringify(products));
}

// Add product to the Expiring Products section
function addProductToExpiringList(product) {
  const expiringList = document.getElementById('expiring-list');
  if (!expiringList) return; // Only run on index.html
  const productDiv = document.createElement('div');
  productDiv.classList.add('product', 'expiring');
  productDiv.innerHTML = `
    <h3>${product.name}</h3>
    <p><strong>ID:</strong> ${product.id}</p>
    <p><strong>Expiry Date:</strong> ${product.expiryDate}</p>
    <p class="warning">Expiring Soon!</p>
  `;
  expiringList.appendChild(productDiv);
}

// Save product to local storage (not used directly since server manages the list)
function saveToLocalStorage(product) {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const existingProductIndex = products.findIndex(p => p.id === product.id);
  if (existingProductIndex !== -1) {
    // Remove the product if it exists
    products.splice(existingProductIndex, 1);
    console.log(`Product ${product.name} (ID: ${product.id}) removed from local storage`);
  } else {
    // Add the product if it doesn't exist
    products.push(product);
    console.log(`Product ${product.name} (ID: ${product.id}) saved to local storage`);
  }
  localStorage.setItem('products', JSON.stringify(products));
}

// Check if a product is expiring within 5 days
function isExpiringSoon(expiryDate) {
  const currentDate = new Date('2025-03-27T00:00:00'); // Current date as per system, set to midnight
  let expDate;
  
  try {
    // Ensure the expiryDate is in YYYY-MM-DD format and set to midnight
    expDate = new Date(expiryDate + 'T00:00:00');
    if (isNaN(expDate.getTime())) {
      console.error(`Invalid expiry date: ${expiryDate}`);
      return false;
    }
  } catch (error) {
    console.error(`Error parsing expiry date ${expiryDate}:`, error);
    return false;
  }

  const diffTime = expDate - currentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days
  console.log(`Product expiry date: ${expiryDate}, Current date: ${currentDate.toISOString().split('T')[0]}, Diff days: ${diffDays}`);
  return diffDays <= 5 && diffDays >= 0; // Expiring within 5 days and not already expired
}

// Update the expiring products list
function updateExpiringList(products) {
  const expiringList = document.getElementById('expiring-list');
  const expiringCount = document.getElementById('expiring-count');
  const notificationCount = document.getElementById('notification-count');
  if (!expiringList) {
    console.log('Expiring list element not found');
    return; // Only run on index.html
  }
  console.log('Updating expiring products list');
  expiringList.innerHTML = ''; // Clear the list
  
  let count = 0;
  products.forEach(product => {
    if (isExpiringSoon(product.expiryDate)) {
      console.log(`Adding product to expiring list: ${product.name}`);
      addProductToExpiringList(product);
      count++;
    }
  });
  
  if (expiringCount) {
    expiringCount.textContent = count;
    expiringCount.style.display = count > 0 ? 'inline-block' : 'none';
  }
  if (notificationCount) {
    notificationCount.textContent = count;
    notificationCount.style.display = count > 0 ? 'inline-block' : 'none';
  }
}
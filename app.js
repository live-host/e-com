// js/app.js

// কনফিগারেশন 
const API_URL = 'আপনার_গুগল_অ্যাপ_স্ক্রিপ্ট_ইউআরএল_এখানে_দিন'; // <-- Web App URL
const WHATSAPP_NUMBER = '8801XXXXXXXXX'; // <-- আপনার নাম্বার (Country code সহ)

// গ্লোবাল ভ্যারিয়েবল
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('proShopCart')) || [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const loadingState = document.getElementById('loadingState');
const cartCount = document.getElementById('cartCount');
const categoryFilter = document.getElementById('categoryFilter');

// ইনিশিয়ালাইজেশন
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
    
    // সার্চ ইভেন্ট লিসেনার
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('mobileSearchInput').addEventListener('input', handleSearch);
});

// গুগল শিট থেকে ডেটা আনা
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        
        if (json.success) {
            allProducts = json.data;
            loadingState.classList.add('hidden');
            productsGrid.classList.remove('hidden');
            renderProducts(allProducts);
            generateCategories();
        }
    } catch (error) {
        loadingState.innerHTML = '<p class="text-red-500">ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে রিলোড করুন।</p>';
    }
}

// প্রোডাক্ট রেন্ডার করা
function renderProducts(products) {
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">কোনো পণ্য পাওয়া যায়নি!</div>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col';
        card.innerHTML = `
            <div class="relative pt-[100%] overflow-hidden bg-gray-100">
                <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute top-2 right-2 bg-white px-2 py-1 rounded text-[10px] font-bold text-gray-600 shadow-sm uppercase tracking-wide">${product.category}</div>
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-sm md:text-base font-bold text-gray-800 leading-tight mb-1 line-clamp-2">${product.name}</h3>
                <p class="text-gray-500 text-xs mb-3 line-clamp-2 flex-grow">${product.description || ''}</p>
                <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span class="text-lg font-black text-indigo-600">৳ ${product.price}</span>
                    <button onclick="addToCart('${product.id}')" class="h-8 w-8 rounded-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 flex items-center justify-center transition-colors">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// ক্যাটাগরি তৈরি ও ফিল্টার
function generateCategories() {
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.onclick = () => filterCategory(category, btn);
        btn.className = 'px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50 transition category-btn';
        btn.innerText = category;
        categoryFilter.appendChild(btn);
    });
}

function filterCategory(category, btnElement = null) {
    // Reset buttons UI
    document.querySelectorAll('#categoryFilter button').forEach(b => {
        b.className = 'px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50 transition category-btn';
    });
    
    // Set active UI
    if(btnElement) {
        btnElement.className = 'px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-sm category-btn';
    } else {
        document.querySelector('#categoryFilter button').className = 'px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-sm category-btn';
    }

    const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
    renderProducts(filtered);
}

// সার্চ লজিক
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
    );
    renderProducts(filtered);
}

// কার্ট ম্যানেজমেন্ট
function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast();
}

function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('proShopCart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-400">
                <i class="fas fa-shopping-basket text-5xl mb-4 opacity-50"></i>
                <p>আপনার ব্যাগ সম্পূর্ণ খালি!</p>
            </div>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
            totalItems += item.quantity;
            totalPrice += (parseFloat(item.price) * item.quantity);
            return `
                <div class="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <img src="${item.image || 'https://via.placeholder.com/100'}" class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1 flex flex-col justify-between">
                        <h4 class="text-sm font-bold text-gray-800 leading-tight">${item.name}</h4>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-indigo-600 font-bold text-sm">৳ ${item.price}</span>
                            <div class="flex items-center bg-gray-100 rounded-lg">
                                <button onclick="updateQuantity('${item.id}', -1)" class="px-2 py-1 text-gray-600 hover:text-black">-</button>
                                <span class="px-2 text-xs font-bold">${item.quantity}</span>
                                <button onclick="updateQuantity('${item.id}', 1)" class="px-2 py-1 text-gray-600 hover:text-black">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    cartCount.innerText = totalItems;
    document.getElementById('cartTotal').innerText = `৳ ${totalPrice.toLocaleString('bn-BD')}`;
}

// UI Controls
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('translate-x-full');
    document.getElementById('cartOverlay').classList.toggle('hidden');
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2000);
}

// হোয়াটসঅ্যাপ চেকআউট
function processCheckout() {
    if (cart.length === 0) {
        alert("আপনার কার্টে কোনো পণ্য নেই!");
        return;
    }

    let message = "*নতুন অর্ডার!*\n\n";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        grandTotal += itemTotal;
        message += `${index + 1}. *${item.name}*\n   পরিমাণ: ${item.quantity} টি | দাম: ৳${itemTotal}\n`;
    });

    message += `\n*সর্বমোট বিল: ৳${grandTotal}*\n\nআমি এই পণ্যগুলো অর্ডার করতে চাচ্ছি।`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // অর্ডার করার পর কার্ট ক্লিয়ার করতে চাইলে নিচের লাইনগুলো আনকমেন্ট করতে পারেন
    // cart = [];
    // saveCart();
    // updateCartUI();
    // toggleCart();
}

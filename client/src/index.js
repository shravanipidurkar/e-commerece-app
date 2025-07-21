// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/js/Home';
import Login from "./pages/js/login";
import SignUp from "./pages/js/signup";
import AdminOverview from './pages/js/admin-overview';
import AddOrder from './pages/js/addOrders';
import AddCategory from './pages/js/AddCategory';
import AddProduct from './pages/js/addProducts';
import AddCustomer from './pages/js/addCustomer';
// import AddCustomer from './pages/js/addCustomer';
import reportWebVitals from './reportWebVitals';
import Template from './pages/js/template';
// Correct path to your component
import AddFeedback from './pages/js/Addfeedback'; 
import CartPage from './pages/js/Cartpage';
import { CartProvider } from './pages/js/CartContext'; 
import Customer_Login from './pages/js/Customer_Login'; 
import Customer_Signup from './pages/js/Customer_Signup';
import CustomerProfile from './pages/js/CustomerProfile'; 
import SuccessPage from './pages/js/success';
import Storetemplate from './pages/js/Storetemplate';
import FeaturesPage from './pages/js/features';
import OwnerAdmin from './pages/js/Owner-admin';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <CartProvider>
    <BrowserRouter>
      <Routes>
         <Route path="/admin/owner-admin" element={<OwnerAdmin />} />

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/addorder" element={<AddOrder />} />
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/store/:storeId/add" element={<AddFeedback />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/addcustomer" element={<AddCustomer />} />
        <Route path="/AdminOverview" element={<AdminOverview />} />
        <Route path="/store/:storeId/template" element={<Template />} />
        <Route path="/store/:storeId/Storetemplate" element={<Storetemplate />} />
       <Route path="/store/:storeId/success" element={<SuccessPage />} />
        <Route path="/store/:storeId/cart" element={<CartPage />} />
        <Route path="/store/:storeId/login" element={<Customer_Login />} />
       <Route path="/store/:storeId/signup" element={<Customer_Signup />} />
       <Route path="/store/:storeId/CustomerProfile" element={<CustomerProfile />} />
       <Route path="/store/:slug" element={<Storetemplate />} />
       <Route path="/explore" element={<FeaturesPage/>} />

    
      </Routes>
    </BrowserRouter>
  </CartProvider>
</React.StrictMode>

);

reportWebVitals();

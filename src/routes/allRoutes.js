import React from "react"
import { Navigate } from "react-router-dom"

// Profile
import MyProfile from "../pages/Authentication/my-profile"


// Authentication related pages
import Login from "../pages/Authentication/Login"
import Logout from "../pages/Authentication/Logout"
import Register from "../pages/Authentication/Register"
import ForgetPwd from "../pages/Authentication/ForgetPassword"
import ForgetPwd2 from "../pages/Authentication/ForgetPassword2"
import OtpPage from "../pages/Authentication/OtpPage"
import ResetPasswordPage from "../pages/Authentication/ResetPasswordPage"

// Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login"
import Register1 from "../pages/AuthenticationInner/Register"
import Recoverpw from "../pages/AuthenticationInner/Recoverpw"
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen"

// Dashboard
import Dashboard from "../pages/Dashboard/index"
import Users from "../pages/User"
import Roles from "../pages/Role"
import Menus from "../pages/Menu"
import Lov from "../pages/Lov"
import Property from "../pages/Property"

import AdvancePayment from "../pages/AdvancePayment"
//Extra Pages
import PagesBlank from "../pages/Extra Pages/pages-blank";
import Pages404 from "../pages/Extra Pages/pages-404";
import Pages500 from "../pages/Extra Pages/pages-500";

import UserDemo from "../pages/UserDemo";
import Expenses from "../pages/Expense";
import ExpenseCategories from "../pages/ExpenseCategory";
import ItemCategories from "../pages/ItemCategory";
import Items from "../pages/Item";
import Customers from "../pages/Customer";
import Quotations from "../pages/Quotation";
import Orders from "../pages/Order";
import Payments from "../pages/Payment";
import Invoices from "../pages/Invoice";

import OrderReport from "../pages/OrderReport";

const userRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  // AdvancePayment routes
  //{ path: "/AdvancePayment", component: <AdvancePayment /> },
  { path: "/AdvancePayment", component: <AdvancePayment /> },
  { path: "/AdvancePayment/manage", component: <AdvancePayment /> },
  { path: "/AdvancePayment/manage/:id", component: <AdvancePayment /> },
// { path: "/AdvancePaymentHistory", component: <AdvancePaymentHistory /> },
  // // //profile
  { path: "/profile", component: <MyProfile /> },

  // OrderReport routes
  { path: "/OrderReport", component: <OrderReport /> },

  { path: "/User", component: <Users /> },
  { path: "/User/manage", component: <Users /> },
  { path: "/User/manage/:id", component: <Users /> },

  { path: "/Role", component: <Roles /> },
  { path: "/Role/manage", component: <Roles /> },
  { path: "/Role/manage/:id", component: <Roles /> },

  { path: "/Menu", component: <Menus /> },
  { path: "/Menu/manage", component: <Menus /> },
  { path: "/Menu/manage/:id", component: <Menus /> },

  { path: "/Lov", component: <Lov /> },
  { path: "/Lov/manage", component: <Lov /> },
  { path: "/Lov/manage/:lovColumn", component: <Lov /> },
  { path: "/Lov/details/:lovColumn", component: <Lov /> },
  { path: "/Lov/details/:lovColumn/manage", component: <Lov /> },
  { path: "/Lov/details/:lovColumn/manage/:lovCode", component: <Lov /> },

  { path: "/pages-blank", component: <PagesBlank /> },
  { path: "/UserDemo", component: <UserDemo /> },
  { path: "/UserDemo/manage", component: <UserDemo /> },
  { path: "/UserDemo/manage/:id", component: <UserDemo /> },

  { path: "/Property", component: <Property /> },
  { path: "/Property/manage", component: <Property /> },
  { path: "/Property/manage/:id", component: <Property /> },

  { path: "/Expense", component: <Expenses /> },
  { path: "/Expense/manage", component: <Expenses /> },
  { path: "/Expense/manage/:id", component: <Expenses /> },

  { path: "/ExpenseCategory", component: <ExpenseCategories /> },
  { path: "/ExpenseCategory/manage", component: <ExpenseCategories /> },
  { path: "/ExpenseCategory/manage/:id", component: <ExpenseCategories /> },

  { path: "/ItemCategory", component: <ItemCategories /> },
  { path: "/ItemCategory/manage", component: <ItemCategories /> },
  { path: "/ItemCategory/manage/:id", component: <ItemCategories /> },

  { path: "/Item", component: <Items /> },
  { path: "/Item/manage", component: <Items /> },
  { path: "/Item/manage/:id", component: <Items /> },

  { path: "/Customer", component: <Customers /> },
  { path: "/Customer/manage", component: <Customers /> },
  { path: "/Customer/manage/:id", component: <Customers /> },

  { path: "/Quotation", component: <Quotations /> },
  { path: "/Quotation/manage", component: <Quotations /> },
  { path: "/Quotation/manage/:id", component: <Quotations /> },
  { path: "/Quotation/convert-to-order/:id", component: <Quotations /> },

  { path: "/Order", component: <Orders /> },
  { path: "/Order/manage", component: <Orders /> },
  { path: "/Order/manage/:id", component: <Orders /> },

  { path: "/Payment", component: <Payments /> },
  { path: "/Payment/manage", component: <Payments /> },

  { path: "/Invoice", component: <Invoices /> },
  { path: "/Invoice/manage", component: <Invoices /> },
  { path: "/Invoice/manage/:id", component: <Invoices /> },

  // this route should be at the end of all other routes
  {
    path: "/",
    exact: true,
    component: <Navigate to="/login" />,
  },
]

const authRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/forgot-password2", component: <ForgetPwd2 /> },
  { path: "/register", component: <Register /> },
  { path: "/otp", component: <OtpPage /> },
  { path: "/reset-password", component: <ResetPasswordPage /> },

  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },

  // Authentication Inner
  { path: "/pages-login", component: <Login1 /> },
  { path: "/pages-register", component: <Register1 /> },
  { path: "/page-recoverpw", component: <Recoverpw /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
]

export { userRoutes, authRoutes }
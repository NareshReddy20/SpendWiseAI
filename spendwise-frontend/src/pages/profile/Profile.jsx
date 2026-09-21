import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import {
  useProfileQuery,
  useUpdateProfileMutation,
  useProfileSummaryQuery
} from "../../tanstack/alltanstack";


const Profile = () => {
const { setLoggedInUser } = useAuth();
  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currency: "INR",
    monthlyIncomeTarget: "",
    savingsGoal: ""
  });

  const [success, setSuccess] = useState(false);


  // =========================
  // GET PROFILE
  // =========================

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorData
  } = useProfileQuery();


  // =========================
  // GET PROFILE SUMMARY
  // =========================

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError
  } = useProfileSummaryQuery();


  // =========================
  // UPDATE PROFILE
  // =========================

  const updateProfileMutation =
    useUpdateProfileMutation();


  // =========================
  // LOAD PROFILE DATA
  // =========================

  useEffect(() => {

    if (profileData?.profile) {

      const profile = profileData.profile;

      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        currency: profile.currency || "INR",

        monthlyIncomeTarget:
          profile.monthly_income_target ?? "",

        savingsGoal:
          profile.savings_goal ?? ""
      });

    }

  }, [profileData]);


  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

  };


  // =========================
  // UPDATE PROFILE
  // =========================

const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    await updateProfileMutation.mutateAsync({

      name: formData.name,

      currency: formData.currency,

      monthly_income_target:
        Number(formData.monthlyIncomeTarget) || 0,

      savings_goal:
        Number(formData.savingsGoal) || 0

    });

    // Update only the changed user information
    setLoggedInUser({
      name: formData.name
    });

    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 3000);

  } catch (error) {

    console.error(
      "Profile update error:",
      error
    );

  }

};


  // =========================
  // LOADING
  // =========================

  if (profileLoading || summaryLoading) {

    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center"
        }}
      >
        Loading profile...
      </div>
    );

  }


  // =========================
  // PROFILE ERROR
  // =========================

  if (profileError) {

    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#f44336"
        }}
      >
        Failed to load profile.

        <div style={{ marginTop: "8px" }}>
          {profileErrorData?.response?.data?.detail ||
            profileErrorData?.message ||
            "Something went wrong"}
        </div>
      </div>
    );

  }


  // =========================
  // SUMMARY
  // =========================

  const summary = summaryData?.summary || {};


  return (

    <div>

      {/* =========================
          PAGE TITLE
      ========================= */}

      <h2 style={{ marginBottom: "20px" }}>
        Profile
      </h2>


      {/* =========================
          PROFILE INFORMATION
      ========================= */}

      <Card>

        <h3 style={{ marginBottom: "20px" }}>
          Profile Information
        </h3>


        {/* SUCCESS MESSAGE */}

        {success && (

          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            Profile updated successfully!
          </div>

        )}


        {/* ERROR MESSAGE */}

        {updateProfileMutation.isError && (

          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            {updateProfileMutation.error?.response?.data?.detail ||
              updateProfileMutation.error?.message ||
              "Failed to update profile"}
          </div>

        )}


        <form onSubmit={handleSubmit}>

          {/* BASIC INFORMATION */}

          <div className="form-row">

            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />


            <Input
              label="Email"
              name="email"
              value={formData.email}
              disabled
              style={{
                background: "#f5f5f5"
              }}
            />

          </div>


          {/* FINANCIAL PREFERENCES */}

          <h3
            style={{
              margin: "25px 0 20px"
            }}
          >
            Financial Preferences
          </h3>


          <div className="form-row">

            <Input
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="INR"
              required
            />


            <Input
              label="Monthly Income Target"
              name="monthlyIncomeTarget"
              type="number"
              value={formData.monthlyIncomeTarget}
              onChange={handleChange}
              placeholder="50000"
              min="0"
            />

          </div>


          <Input
            label="Monthly Savings Goal"
            name="savingsGoal"
            type="number"
            value={formData.savingsGoal}
            onChange={handleChange}
            placeholder="10000"
            min="0"
          />


          {/* SAVE BUTTON */}

          <Button
            type="submit"
            variant="primary"
            disabled={updateProfileMutation.isPending}
            style={{
              marginTop: "20px"
            }}
          >
            {updateProfileMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>

        </form>

      </Card>


      {/* =========================
          ACCOUNT SUMMARY
      ========================= */}

      <Card
        style={{
          marginTop: "20px"
        }}
      >

        <h3
          style={{
            marginBottom: "20px"
          }}
        >
          Account Summary
        </h3>


        {/* ACCOUNT TYPE + TRANSACTIONS */}

        <div className="form-row">

          <div>

            <p>
              <strong>Account Type</strong>
            </p>

            <p>
              {summary.account_type || "Personal"}
            </p>

          </div>


          <div>

            <p>
              <strong>Total Transactions</strong>
            </p>

            <p>
              {summary.total_transactions || 0}
            </p>

          </div>

        </div>


        {/* INCOME + EXPENSES */}

        <div className="form-row">

          <div>

            <p>
              <strong>Total Income</strong>
            </p>

            <p>
              {formData.currency}{" "}
              {Number(
                summary.total_income || 0
              ).toLocaleString()}
            </p>

          </div>


          <div>

            <p>
              <strong>Total Expenses</strong>
            </p>

            <p>
              {formData.currency}{" "}
              {Number(
                summary.total_expenses || 0
              ).toLocaleString()}
            </p>

          </div>

        </div>


        {/* CURRENT BALANCE */}

        <div
          style={{
            marginTop: "15px"
          }}
        >

          <p>
            <strong>Current Balance</strong>
          </p>

          <p>

            {formData.currency}{" "}

            {Number(
              summary.current_balance || 0
            ).toLocaleString()}

          </p>

        </div>


        {/* SUMMARY ERROR */}

        {summaryError && (

          <div
            style={{
              marginTop: "15px",
              color: "#f44336"
            }}
          >
            Failed to load account summary.
          </div>

        )}

      </Card>

    </div>

  );

};


export default Profile;
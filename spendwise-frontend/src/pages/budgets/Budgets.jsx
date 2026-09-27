import React, { useState } from 'react';

import BudgetCard from '../../components/budgets/BudgetCard';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

import {
  useBudgetsQuery,
  useAddBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation
} from '../../tanstack/alltanstack';


const Budgets = () => {

  // ============================================
  // STATE
  // ============================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    monthlyLimit: ''
  });

  const [errors, setErrors] = useState({});


  // ============================================
  // GET BUDGETS
  // ============================================

  const {
    data,
    isLoading,
    isError,
    error
  } = useBudgetsQuery();


  // ============================================
  // MUTATIONS
  // ============================================

  const {
    mutateAsync: addBudget,
    isPending: isAdding
  } = useAddBudgetMutation();


  const {
    mutateAsync: updateBudget,
    isPending: isUpdating
  } = useUpdateBudgetMutation();


  const {
    mutateAsync: deleteBudget,
    isPending: isDeleting
  } = useDeleteBudgetMutation();


  // ============================================
  // BUDGET DATA
  // ============================================

  const budgets = data?.budgets || [];


  // ============================================
  // LOADING STATE
  // ============================================

  const isSaving = isAdding || isUpdating;


  // ============================================
  // CATEGORIES
  // ============================================

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Healthcare',
    'Education',
    'Other'
  ];


  // ============================================
  // ADD BUDGET
  // ============================================

  const handleAddBudget = () => {

    setEditingBudget(null);

    setFormData({
      category: '',
      monthlyLimit: ''
    });

    setErrors({});

    setIsModalOpen(true);
  };


  // ============================================
  // EDIT BUDGET
  // ============================================

  const handleEditBudget = (budget) => {

    setEditingBudget(budget);

    setFormData({
      category: budget.category,
      monthlyLimit: budget.monthly_limit
    });

    setErrors({});

    setIsModalOpen(true);
  };


  // ============================================
  // DELETE BUDGET
  // ============================================

  const handleDeleteBudget = async (id) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this budget?'
    );

    if (!confirmed) {
      return;
    }

    try {

      const response = await deleteBudget({
        budget_id: id
      });

      console.log(
        'Budget deleted successfully:',
        response
      );

      // Refresh budgets after deletion
      window.location.reload();

    } catch (error) {

      console.error(
        'Error deleting budget:',
        error
      );

      alert(
        error.response?.data?.detail ||
        'Failed to delete budget'
      );
    }
  };


  // ============================================
  // FORM VALIDATION
  // ============================================

  const validate = () => {

    const newErrors = {};


    if (!formData.category) {

      newErrors.category =
        'Please select a category';

    }


    if (
      !formData.monthlyLimit ||
      parseFloat(formData.monthlyLimit) <= 0
    ) {

      newErrors.monthlyLimit =
        'Please enter a valid limit';

    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // ============================================
  // SUBMIT BUDGET
  // ============================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    console.log('Form data:', formData);
    console.log('Category:', formData.category);
    if (!validate()) {
      return;
    }


    try {

      // ========================================
      // UPDATE EXISTING BUDGET
      // ========================================

      if (editingBudget) {

        const updateData = {
          budget_id: editingBudget.id,
          category: formData.category,
          monthly_limit:
            parseFloat(formData.monthlyLimit)
        };


        const response =
          await updateBudget(updateData);


        console.log(
          'Budget updated successfully:',
          response
        );

      }


      // ========================================
      // ADD NEW BUDGET
      // ========================================

      else {

        const addData = {
          category: formData.category,
          monthly_limit:
            parseFloat(formData.monthlyLimit)
        };


        const response =
          await addBudget(addData);


        console.log(
          'Budget added successfully:',
          response
        );

      }


      // Close modal
      setIsModalOpen(false);


      // Reset form
      setFormData({
        category: '',
        monthlyLimit: ''
      });

      setEditingBudget(null);

      setErrors({});


      // Refresh page data
      window.location.reload();

    } catch (error) {

      console.error(
        'Error saving budget:',
        error
      );


      setErrors({
        submit:
          error.response?.data?.detail ||
          'Failed to save budget'
      });

    }
  };


  // ============================================
  // FORM CHANGE
  // ============================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // ============================================
  // LOADING
  // ============================================

  if (isLoading) {

    return (
      <div>

        <h2 style={{ marginBottom: '20px' }}>
          Budgets
        </h2>

        <Card>

          <p
            style={{
              textAlign: 'center',
              padding: '30px'
            }}
          >
            Loading budgets...
          </p>

        </Card>

      </div>
    );
  }


  // ============================================
  // ERROR
  // ============================================

  if (isError) {

    return (
      <div>

        <h2 style={{ marginBottom: '20px' }}>
          Budgets
        </h2>

        <Card>

          <p
            style={{
              textAlign: 'center',
              padding: '30px',
              color: 'red'
            }}
          >
            {error?.response?.data?.detail ||
              'Failed to load budgets'}
          </p>

        </Card>

      </div>
    );
  }


  // ============================================
  // JSX
  // ============================================

  return (
    <div>

      {/* ========================================
          HEADER
      ======================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >

        <h2>
          Budgets
        </h2>


        <Button
          variant="primary"
          onClick={handleAddBudget}
        >
          + Add Budget
        </Button>

      </div>


      {/* ========================================
          BUDGET LIST
      ======================================== */}

      {budgets.length === 0 ? (

        <EmptyState
          message="No budgets set up yet"
          icon="📊"
        />

      ) : (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}
        >

          {budgets.map((budget) => (

            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={budget.spent}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />

          ))}

        </div>

      )}


      {/* ========================================
          ADD / EDIT BUDGET MODAL
      ======================================== */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingBudget
            ? 'Edit Budget'
            : 'Add Budget'
        }
      >

        <form onSubmit={handleSubmit}>

          {/* CATEGORY */}

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Select a category"
            options={categories.map((category) => ({
              value: category,
              label: category
            }))}
            error={errors.category}
            required
          />


          {/* MONTHLY LIMIT */}

          <Input
            label="Monthly Limit (₹)"
            name="monthlyLimit"
            type="number"
            value={formData.monthlyLimit}
            onChange={handleChange}
            placeholder="e.g., 15000"
            error={errors.monthlyLimit}
            required
          />


          {/* API ERROR */}

          {errors.submit && (

            <p
              style={{
                color: 'red',
                marginTop: '10px'
              }}
            >
              {errors.submit}
            </p>

          )}


          {/* BUTTONS */}

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}
          >

            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >

              {isSaving
                ? 'Saving...'
                : editingBudget
                  ? 'Update Budget'
                  : 'Add Budget'
              }

            </Button>


            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
};


export default Budgets;
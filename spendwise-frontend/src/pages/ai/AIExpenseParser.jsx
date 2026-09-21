import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

import {
  useParseAITransaction,
  useConfirmAITransaction
} from '../../tanstack/alltanstack';


const AIExpenseParser = () => {
  const navigate = useNavigate();

  // -----------------------------
  // State
  // -----------------------------

  const [text, setText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');


  // -----------------------------
  // Parse AI Transaction Mutation
  // -----------------------------

  const {
    mutate: parseTransaction,
    isPending: isParsing,
    isError: isParseError,
    error: parseError
  } = useParseAITransaction();


  // -----------------------------
  // Confirm Transaction Mutation
  // -----------------------------

  const {
    mutate: confirmTransaction,
    isPending: isConfirming,
    isError: isConfirmError,
    error: confirmError
  } = useConfirmAITransaction();


  // -----------------------------
  // Parse Transaction
  // -----------------------------

  const handleParse = () => {

    if (!text.trim()) {
      setError('Please describe your transaction');
      return;
    }

    setError('');
    setParsedData(null);


    parseTransaction(
      {
        text: text.trim(),
        transaction_type: transactionType
      },
      {
        onSuccess: (data) => {

          console.log('AI Parser Response:', data);

          setParsedData(data);
          setShowResult(true);
        },

        onError: (error) => {

          console.error(
            'AI Parser Error:',
            error
          );

          setShowResult(false);
          setParsedData(null);
        }
      }
    );
  };


  // -----------------------------
  // Confirm & Save Transaction
  // -----------------------------

  const handleConfirm = () => {

    if (!parsedData) {
      return;
    }


    const confirmData = {

      amount: parsedData.amount,

      category: parsedData.category,

      description: parsedData.description,

      date: parsedData.date,

      payment_method:
        parsedData.payment_method || 'Other',

      transaction_type:
        parsedData.transaction_type

    };


    console.log(
      'Confirming transaction:',
      confirmData
    );


    confirmTransaction(
      confirmData,
      {
        onSuccess: (data) => {

          console.log(
            'Transaction saved successfully:',
            data
          );

          navigate('/transactions');
        },

        onError: (error) => {

          console.error(
            'Error saving transaction:',
            error
          );
        }
      }
    );
  };


  // -----------------------------
  // Edit Parsed Transaction
  // -----------------------------

  const handleEdit = () => {

    setShowResult(false);

    setParsedData(null);

    setError('');
  };


  // -----------------------------
  // Change Transaction Type
  // -----------------------------

  const handleTypeChange = (e) => {

    setTransactionType(
      e.target.value
    );

    setShowResult(false);

    setParsedData(null);

    setError('');
  };


  // -----------------------------
  // Start Over
  // -----------------------------

  const handleStartOver = () => {

    setShowResult(false);

    setParsedData(null);

    setText('');

    setError('');
  };


  // -----------------------------
  // Example Transactions
  // -----------------------------

  const getExamples = () => {

    if (transactionType === 'expense') {

      return [
        'I spent ₹450 on dinner yesterday',
        'Bought groceries for ₹2000 at Big Bazaar',
        'Paid ₹1500 for electricity bill',
        'Uber ride cost ₹350'
      ];

    }


    return [
      'Received salary of ₹45000',
      'Got ₹5000 from freelance work',
      '₹2000 interest from fixed deposit',
      'Received ₹1500 as gift'
    ];
  };


  const examples = getExamples();


  // -----------------------------
  // JSX
  // -----------------------------

  return (

    <div>

      {/* Page Header */}

      <h2
        style={{
          marginBottom: '8px'
        }}
      >
        AI Transaction Parser
      </h2>


      <p
        style={{
          color: '#666',
          marginBottom: '20px'
        }}
      >
        Describe your expense or income in natural
        language and let AI parse it for you.
      </p>


      {/* Main Parser Card */}

      <Card>

        <div
          style={{
            marginBottom: '16px'
          }}
        >

          {/* Transaction Type */}

          <Select
            label="Transaction Type"
            value={transactionType}
            onChange={handleTypeChange}
            options={[
              {
                value: 'expense',
                label: '💰 Expense'
              },
              {
                value: 'income',
                label: '📈 Income'
              }
            ]}
            style={{
              marginBottom: '16px'
            }}
          />


          {/* Transaction Description */}

          <Input
            label="Describe your transaction"
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder={
              transactionType === 'expense'
                ? 'e.g., I spent ₹450 on dinner yesterday'
                : 'e.g., Received salary of ₹45000'
            }
            disabled={
              showResult || isParsing
            }
            error={error}
          />


          {/* Parse Button */}

          <Button
            variant="primary"
            onClick={handleParse}
            disabled={
              !text.trim() ||
              isParsing ||
              showResult
            }
            style={{
              marginTop: '8px'
            }}
          >
            {isParsing
              ? 'Parsing...'
              : '🤖 Parse with AI'}
          </Button>


          {/* Parse Error */}

          {isParseError && (

            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                background: '#ffebee',
                borderRadius: '8px',
                color: '#c62828',
                fontSize: '14px'
              }}
            >
              ❌{' '}

              {
                parseError?.response?.data?.detail ||
                'Failed to parse transaction. Please try again.'
              }

            </div>

          )}

        </div>


        {/* Example Suggestions */}

        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#666'
          }}
        >

          <strong>
            💡 Try these examples:
          </strong>

          <br />


          {examples.map(
            (example, index) => (

              <span
                key={index}
                onClick={() => {

                  setText(example);

                  setError('');

                  setShowResult(false);

                  setParsedData(null);

                }}
                style={{
                  display: 'inline-block',
                  margin: '4px 4px 0 0',
                  padding: '4px 10px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {example}
              </span>

            )
          )}

        </div>


        {/* Parsed Result */}

        {showResult && parsedData && (

          <div
            style={{
              marginTop: '20px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}
          >

            {/* Result Header */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}
            >

              <h4
                style={{
                  margin: 0
                }}
              >
                📋 Parsed Result
              </h4>


              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',

                  background:
                    parsedData.transaction_type === 'income'
                      ? '#e8f5e9'
                      : '#fce4ec',

                  color:
                    parsedData.transaction_type === 'income'
                      ? '#4caf50'
                      : '#f44336',

                  fontSize: '12px',

                  fontWeight: '600'
                }}
              >

                {
                  parsedData.transaction_type === 'income'
                    ? 'INCOME'
                    : 'EXPENSE'
                }

              </span>

            </div>


            {/* Parsed Information */}

            <div
              style={{
                display: 'grid',
                gap: '8px'
              }}
            >

              <p>
                <strong>
                  Amount:
                </strong>{' '}

                ₹{parsedData.amount}
              </p>


              <p>
                <strong>
                  Category:
                </strong>{' '}

                {parsedData.category}
              </p>


              <p>
                <strong>
                  Description:
                </strong>{' '}

                {parsedData.description}
              </p>


              <p>
                <strong>
                  Date:
                </strong>{' '}

                {parsedData.date}
              </p>


              {parsedData.payment_method && (

                <p>

                  <strong>
                    Payment Method:
                  </strong>{' '}

                  {parsedData.payment_method}

                </p>

              )}


              <p>

                <strong>
                  Confidence:
                </strong>{' '}

                {
                  Number(
                    parsedData.confidence_score
                  ) * 100
                }%

              </p>

            </div>


            {/* Confirm Error */}

            {isConfirmError && (

              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#ffebee',
                  borderRadius: '8px',
                  color: '#c62828',
                  fontSize: '14px'
                }}
              >

                ❌{' '}

                {
                  confirmError?.response?.data?.detail ||
                  'Failed to save transaction. Please try again.'
                }

              </div>

            )}


            {/* Action Buttons */}

            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px'
              }}
            >

              {/* Confirm & Save */}

              <Button
                variant="success"
                onClick={handleConfirm}
                disabled={isConfirming}
              >

                {isConfirming
                  ? 'Saving...'
                  : '✅ Confirm & Save'}

              </Button>


              {/* Edit */}

              <Button
                variant="secondary"
                onClick={handleEdit}
                disabled={isConfirming}
              >
                ✏️ Edit
              </Button>


              {/* Start Over */}

              <Button
                variant="secondary"
                onClick={handleStartOver}
                disabled={isConfirming}
              >
                🔄 Start Over
              </Button>

            </div>

          </div>

        )}


        {/* Helper Message */}

        {!showResult &&
          !isParsing &&
          text.trim() && (

            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                background: '#e3f2fd',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1565c0'
              }}
            >

              💡 Click "Parse with AI" to extract
              transaction details from your description

            </div>

          )}

      </Card>


      {/* Quick Stats */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '20px'
        }}
      >

        {/* Expense Examples */}

        <Card>

          <h4
            style={{
              marginBottom: '8px'
            }}
          >
            💰 Expense Examples
          </h4>


          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '14px',
              color: '#666'
            }}
          >

            <li
              style={{
                padding: '4px 0'
              }}
            >
              • "Spent ₹500 on groceries"
            </li>


            <li
              style={{
                padding: '4px 0'
              }}
            >
              • "Paid ₹1500 for electricity bill"
            </li>


            <li
              style={{
                padding: '4px 0'
              }}
            >
              • "Uber ride ₹350"
            </li>

          </ul>

        </Card>


        {/* Income Examples */}

        <Card>

          <h4
            style={{
              marginBottom: '8px'
            }}
          >
            📈 Income Examples
          </h4>


          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '14px',
              color: '#666'
            }}
          >

            <li
              style={{
                padding: '4px 0'
              }}
            >
              • "Received salary of ₹45000"
            </li>


            <li
              style={{
                padding: '4px 0'
              }}
            >
              • "Freelance payment ₹5000"
            </li>


            <li
              style={{
                padding: '4px 0'
              }}
            >
              • "Interest income ₹2000"
            </li>

          </ul>

        </Card>

      </div>

    </div>
  );
};


export default AIExpenseParser;
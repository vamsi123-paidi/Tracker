import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ShowQuiz from "../categories/ShowQuiz"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"


const EditQuizzes = ({ quizzes }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [selectedQuizEdit, setSelectedQuizEdit] = useState(null)

  const nav = useNavigate()

  const handleConfirmDelete = () => {
    handleDeleteQuiz(selectedQuiz._id)
    alert("Quiz deleted successfully")
    setSelectedQuiz(null)
    refreshPage()
  }

  const handleDeleteQuiz = async (id) => {
    try {
      const res = await fetch(
        `https://quiz-app-server-production-09e8.up.railway.app/quizzes/${id}`,
        {
          method: "DELETE",
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

  function DeleteConfirmation(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Are you sure you want to delete the quiz?
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="primary" onClick={handleConfirmDelete}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={props.onHide}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  // function to reload page to remove deleted quiz. May not need it later on.
  function refreshPage() {
    window.location.reload(false)
  }

  const handleConfirmEdit = () => {
    console.log("calling edit quiz :", selectedQuizEdit._id)
    nav(`/edit-a-quiz/${selectedQuizEdit._id}`)
  }

  function EditConfirmation(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Are you sure you want to edit the quiz?
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="primary" onClick={handleConfirmEdit}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={props.onHide}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const [showPopup, setShowPopup] = useState(false)
  useEffect(() => {
    setShowPopup(true)
  }, [])

  return (
    <>
      <div className="main-body flex-wrap">
        <h1>Choose a Quiz to edit or delete</h1>
        <ul className="d-flex justify-content-center flex-wrap ">
          {quizzes.length === 0
            ? "Loading..."
            : quizzes.map((quiz, index) => (
              <div
                key={index}
                className="card m-3"
                style={{ width: "15rem" }}
              >
                <ShowQuiz quiz={quiz} />
                <ul>
                  <button onClick={() => setSelectedQuizEdit(quiz)}>
                    Edit
                  </button>
                  <button onClick={() => setSelectedQuiz(quiz)}>
                    Delete
                  </button>
                </ul>
              </div>
            ))}
        </ul>
        {selectedQuiz && (
          <DeleteConfirmation
            show={showPopup}
            value={false}
            onHide={(e) => {
              setSelectedQuiz(null)
            }}
          />
        )}
        {selectedQuizEdit && (
          <EditConfirmation
            show={showPopup}
            value={false}
            onHide={(e) => {
              setSelectedQuizEdit(null)
            }}
          />
        )}
      </div>
    </>
  )
}

export default EditQuizzes

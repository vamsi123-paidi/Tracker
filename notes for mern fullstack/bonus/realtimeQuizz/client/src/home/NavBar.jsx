import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
          <Link className='navbar-brand' to='/'>
          <img src={logo} alt='Logo' width='50' height='50' />
          </Link>
          <Link className="navbar-brand" to="/"></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
              <li className="nav-item">
              <Link className='nav-link' to='/quizzes'>All Quizzes</Link>
              </li>
              <li className="nav-item">
              <Link className='nav-link' to='/categories'>Categories</Link>
              </li>
              <li className="nav-item">
              <Link className='nav-link' to='/make-a-quiz'>Make a quiz</Link>
              </li>
              <li className="nav-item">
              <Link className='nav-link' to='/edit-a-quiz'>Edit a quiz</Link>
              </li>
          </ul>
          </div>
      </div>
    </nav>
  )
}

export default NavBar

// const NavBar = () => {
//   return (
//     <nav className='navbar navbar-expand-lg fixed-top bg-primary bg-gradient'>
//       <div className='container-m'>
//         <Link className='navbar-brand' to='/'>
//           <img src={logo} alt='Logo' width='50' height='50' />
//         </Link>
//       </div>
//       <div className='container-fluid'>
//         <div className='collapse navbar-collapse justify-content-end' id='navbarNavDropdown'>
//           <ul className='navbar-nav float-right'>
//             <li className='nav-item dropdown'>
//               <Link className='nav-link dropdown-toggle' to='#' role='button' data-bs-toggle='dropdown' aria-expanded='false'>
//                 Quizzes
//               </Link>
//               <ul className='dropdown-menu'>
//                 <li><Link className='dropdown-item' to='/quizzes'>All Quizzes</Link></li>
//                 <li><Link className='dropdown-item' to='/categories'>Categories</Link></li>
//                 <li><Link className='dropdown-item' to='/make-a-quiz'>Make a quiz</Link></li>
//                 <li><Link className='dropdown-item' to='/edit-a-quiz'>Edit a quiz</Link></li>
//               </ul>
//             </li>
//             <li className='nav-item'>
//               <Link className='nav-link' to='/leaderboard'>Leaderboard</Link>
//             </li>
//             <li className='nav-item'>
//               <Link className='nav-link' to='/log-in'>Log In</Link>
//             </li>
//             <li className='nav-item'>
//               <Link className='nav-link' to='/profile'>Profile</Link>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   )
// }


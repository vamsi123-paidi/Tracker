import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReturnToTop from '../UI/ReturnToTop'
import RandomCat from './RandomCat'
import '../styles/CommonStyles.css'

const Categories = ({ categories }) => {

  return (
    <>
    <div className='main-body flex-wrap' style = {{height: '100vh'}}>
      <h1>Categories</h1>
      {categories.length === 0 ? 'Loading...' : categories.map((category, index) => (
        <p key={index} data-testid='cat' className="card m-3" style={{width: "20rem"}}>
          <Link to={`/categories/${category.name}`} class='d-flex justify-content-center text-dark fw-bold'  >{category.name}</Link>
        </p>
      ))}
      <RandomCat categories={categories}/>      
      <ReturnToTop />
      
    </div>    
    </>
  )
}

export default Categories
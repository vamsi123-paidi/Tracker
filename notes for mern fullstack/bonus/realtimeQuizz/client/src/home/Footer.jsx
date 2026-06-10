import React from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'react-external-link'

const Footer = () => {
  return (
    <div >
			<div style={{display: 'flex',  justifyContent:'center', alignItems:'center',color:'#FFFFFF', background: 'linear-gradient(to top, #000000,#3e4545)', flexDirection:'column'}}>
					<p>
						<br />
						&copy;
						<ExternalLink href='https://www.linkedin.com/in/thi-nguyen-4b2384169/' style={{color:'#FFFFFF'}}> Thi Nguyen, </ExternalLink>
						<ExternalLink href='https://github.com/Steff4evr' style={{color:'#FFFFFF'}}>Steffy Johnson, </ExternalLink>
						<ExternalLink href='https://www.linkedin.com/in/sian-steel' style={{color:'#FFFFFF'}}>Sian Steel </ExternalLink>
						2023
					</p>
			
			<p style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
					<ExternalLink href='mailto:thequizapp@mail.com' style={{color:' #D86D18'}}>Have suggestions? Get in touch</ExternalLink>
			</p>
			</div>
    </div>
  )
}

export default Footer
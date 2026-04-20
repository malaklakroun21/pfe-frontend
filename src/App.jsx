import { useState } from 'react'
import './App.css'
import Header from './assets/Header/Header.jsx'
import Hero from './assets/Hero/Hero.jsx'
import Blooms from './assets/Blooms/Blooms.jsx'
import SkillScape from './assets/SkillScape/SkillScape.jsx'
import Feedback from './assets/Feedback/Feedback.jsx'

const App = () => {

  return (
    <div className="App">
      <Header />
      <Hero />
      <Blooms />
      <SkillScape />
      <Feedback />
    </div>
  )
}
export default App

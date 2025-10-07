import { Link } from "react-router-dom";

export default function Landing(){
  return (
    <div>
      <section className="container">
        <div className="card" style={{padding:"40px 32px", background:"linear-gradient(180deg, #0b3d2e 0%, #0f4c3a 100%)", color:"#fff", borderColor:"#0a3328"}}>
          <div style={{maxWidth:820}}>
            <div className="badge" style={{background:"rgba(255,255,255,.12)", color:"#fff"}}>Rootd in Community. Driven by Athletes.</div>
            <h1 className="h1" style={{marginTop:10, color:"#fff"}}>Turn your story into real NIL opportunities.</h1>
            <p style={{opacity:.92, margin:"10px 0 18px"}}>
              Take a smart, 30-question quiz and get matched with local businesses that fit your brand and values.
            </p>
            <div style={{display:"flex",gap:12}}>
              <Link to="/quiz" className="btn btn-primary" style={{background:"#1d7a60"}}>Take the Quiz</Link>
              <Link to="/dashboard" className="btn">View Demo</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
        <div className="card card-pad">
          <h3 className="h2" style={{color:"var(--g-900)"}}>1. Take the Quiz</h3>
          <p className="subtle">30 tailored questions to understand your goals, personality, and interests.</p>
        </div>
        <div className="card card-pad">
          <h3 className="h2" style={{color:"var(--g-900)"}}>2. Get Matched</h3>
          <p className="subtle">We match you to local businesses using your interests and location.</p>
        </div>
        <div className="card card-pad">
          <h3 className="h2" style={{color:"var(--g-900)"}}>3. Build Deals</h3>
          <p className="subtle">Connect, collaborate, and manage NIL deals with clarity and compliance.</p>
        </div>
      </section>
    </div>
  );
}

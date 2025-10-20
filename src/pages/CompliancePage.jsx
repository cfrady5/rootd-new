import React, { useState } from 'react';

export default function CompliancePage() {
  const [activeSection, setActiveSection] = useState('overview');
  
  const complianceTopics = [
    {
      id: 'overview',
      title: 'NIL Overview',
      icon: '📋',
      description: 'Understanding the basics of Name, Image, and Likeness rights'
    },
    {
      id: 'disclosure',
      title: 'Disclosure Requirements',
      icon: '📢',
      description: 'How to properly disclose sponsored content and partnerships'
    },
    {
      id: 'contracts',
      title: 'Contract Guidelines',
      icon: '📄',
      description: 'What to look for in partnership agreements'
    },
    {
      id: 'taxes',
      title: 'Tax Considerations',
      icon: '💰',
      description: 'Understanding tax implications of NIL income'
    },
    {
      id: 'resources',
      title: 'Additional Resources',
      icon: '📚',
      description: 'Helpful links and contact information'
    }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--ink)',
              margin: '0 0 20px 0'
            }}>
              Understanding NIL Rights
            </h2>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 95, 52, 0.05) 0%, rgba(44, 95, 52, 0.1) 100%)',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(44, 95, 52, 0.2)',
              marginBottom: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 12px 0'
              }}>
                What is NIL?
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'var(--ink)',
                lineHeight: '1.6',
                margin: 0
              }}>
                Name, Image, and Likeness (NIL) rights allow student-athletes to profit from their personal brand while maintaining their eligibility to compete in college sports. This includes sponsorships, endorsements, social media partnerships, and more.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gap: 'var(--space-lg)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              marginBottom: 'var(--space-xl)'
            }}>
              <div style={{
                background: 'white',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--hair)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--green)',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  ✅ What You CAN Do
                </h4>
                <ul style={{
                  fontSize: '15px',
                  color: 'var(--ink)',
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li>Partner with brands for endorsements</li>
                  <li>Monetize your social media presence</li>
                  <li>Sell autographs and memorabilia</li>
                  <li>Offer camps and training sessions</li>
                  <li>Create and sell your own merchandise</li>
                </ul>
              </div>

              <div style={{
                background: 'white',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--hair)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ff6b6b',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  ❌ What You CANNOT Do
                </h4>
                <ul style={{
                  fontSize: '15px',
                  color: 'var(--ink)',
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li>Use school logos or trademarks</li>
                  <li>Promote activities contrary to school values</li>
                  <li>Engage in pay-for-play arrangements</li>
                  <li>Use school facilities for NIL activities</li>
                  <li>Partner with prohibited entities (gambling, etc.)</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'disclosure':
        return (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--ink)',
              margin: '0 0 20px 0'
            }}>
              Disclosure Requirements
            </h2>
            
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#856404',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                ⚠️ Important Notice
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#856404',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Proper disclosure is required by law for all sponsored content and paid partnerships. Failure to disclose can result in penalties from the FTC and your institution.
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--hair)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 16px 0'
              }}>
                How to Disclose Partnerships
              </h3>
              
              <div style={{
                display: 'grid',
                gap: 'var(--space-lg)',
                marginBottom: 'var(--space-lg)'
              }}>
                <div style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--hair)'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    margin: '0 0 12px 0'
                  }}>
                    📱 Social Media Posts
                  </h4>
                  <p style={{
                    fontSize: '15px',
                    color: 'var(--muted)',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5'
                  }}>
                    Use clear, prominent disclosure at the beginning of your post:
                  </p>
                  <div style={{
                    background: 'white',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--hair)',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: 'var(--ink)'
                  }}>
                    #ad #sponsored #partnership<br/>
                    "Paid partnership with [Brand Name]"<br/>
                    "Thanks to [Brand] for sponsoring this post"
                  </div>
                </div>

                <div style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--hair)'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    margin: '0 0 12px 0'
                  }}>
                    📺 Video Content
                  </h4>
                  <p style={{
                    fontSize: '15px',
                    color: 'var(--muted)',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5'
                  }}>
                    Disclose both verbally and visually:
                  </p>
                  <ul style={{
                    fontSize: '14px',
                    color: 'var(--ink)',
                    paddingLeft: '20px',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    <li>Mention the sponsorship at the beginning</li>
                    <li>Include text overlay or description disclosure</li>
                    <li>Use platform-specific tools (Instagram "Paid Partnership")</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'contracts':
        return (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--ink)',
              margin: '0 0 20px 0'
            }}>
              Contract Guidelines
            </h2>
            
            <div style={{
              background: 'white',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--hair)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 16px 0'
              }}>
                Key Contract Terms to Review
              </h3>
              
              <div style={{
                display: 'grid',
                gap: 'var(--space-lg)'
              }}>
                {[
                  {
                    title: 'Compensation & Payment Terms',
                    details: 'Understand how much you\'ll be paid, when payments are due, and any performance bonuses.'
                  },
                  {
                    title: 'Content Requirements',
                    details: 'Know exactly what content you need to create, posting schedules, and approval processes.'
                  },
                  {
                    title: 'Usage Rights',
                    details: 'Understand how the brand can use your content and for how long.'
                  },
                  {
                    title: 'Exclusivity Clauses',
                    details: 'Check if you\'re restricted from working with competing brands.'
                  },
                  {
                    title: 'Termination Conditions',
                    details: 'Know how either party can end the agreement and any penalties involved.'
                  }
                ].map((item, index) => (
                  <div key={index} style={{
                    padding: 'var(--space-lg)',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--hair)'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'var(--green)',
                      margin: '0 0 8px 0'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      fontSize: '15px',
                      color: 'var(--muted)',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
              border: '1px solid #fc8181',
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#c53030',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                ⚖️ Legal Advice Recommended
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#c53030',
                margin: 0,
                lineHeight: '1.5'
              }}>
                For significant partnerships or complex contracts, consider consulting with a lawyer who specializes in sports and entertainment law.
              </p>
            </div>
          </div>
        );

      case 'taxes':
        return (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--ink)',
              margin: '0 0 20px 0'
            }}>
              Tax Considerations
            </h2>
            
            <div style={{
              background: 'white',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--hair)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 16px 0'
              }}>
                Understanding NIL Income Tax
              </h3>
              
              <div style={{
                display: 'grid',
                gap: 'var(--space-lg)',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}>
                <div style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--hair)'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--green)',
                    margin: '0 0 12px 0'
                  }}>
                    💰 Tax Obligations
                  </h4>
                  <ul style={{
                    fontSize: '15px',
                    color: 'var(--ink)',
                    paddingLeft: '20px',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    <li>NIL income is taxable</li>
                    <li>Report all income over $600</li>
                    <li>Keep detailed records</li>
                    <li>Consider quarterly payments</li>
                    <li>Understand state tax requirements</li>
                  </ul>
                </div>

                <div style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--hair)'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--green)',
                    margin: '0 0 12px 0'
                  }}>
                    📊 Deductible Expenses
                  </h4>
                  <ul style={{
                    fontSize: '15px',
                    color: 'var(--ink)',
                    paddingLeft: '20px',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    <li>Content creation costs</li>
                    <li>Equipment and software</li>
                    <li>Professional services</li>
                    <li>Travel for NIL activities</li>
                    <li>Marketing and promotion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--ink)',
              margin: '0 0 20px 0'
            }}>
              Additional Resources
            </h2>
            
            <div style={{
              display: 'grid',
              gap: 'var(--space-lg)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              <div style={{
                background: 'white',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--hair)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  margin: '0 0 12px 0'
                }}>
                  🏫 Institutional Resources
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: 'var(--muted)',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Contact your school's compliance office for guidance specific to your institution's NIL policies.
                </p>
                <button style={{
                  background: 'var(--green)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Find Your Compliance Office
                </button>
              </div>

              <div style={{
                background: 'white',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--hair)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  margin: '0 0 12px 0'
                }}>
                  📚 Educational Materials
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: 'var(--muted)',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Access official NIL education courses and certification programs.
                </p>
                <button style={{
                  background: 'var(--green)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Browse Courses
                </button>
              </div>

              <div style={{
                background: 'white',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--hair)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  margin: '0 0 12px 0'
                }}>
                  💬 Support & Questions
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: 'var(--muted)',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Get help with NIL questions from our expert support team.
                </p>
                <button style={{
                  background: 'var(--green)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div style={{
          marginBottom: 'var(--space-xl)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: 'var(--ink)',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em'
          }}>
            NIL Compliance
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--muted)',
            margin: 0,
            fontWeight: '500'
          }}>
            Everything you need to know about Name, Image, and Likeness regulations
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 'var(--space-xl)',
          alignItems: 'flex-start'
        }}>
          {/* Topic Navigation */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            border: '1px solid var(--hair)',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 'var(--space-lg)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--ink)',
              margin: '0 0 16px 0'
            }}>
              Topics
            </h3>
            <nav>
              {complianceTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setActiveSection(topic.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-md)',
                    marginBottom: 'var(--space-sm)',
                    background: activeSection === topic.id ? 'var(--green)' : 'transparent',
                    color: activeSection === topic.id ? 'white' : 'var(--ink)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    if (activeSection !== topic.id) {
                      e.target.style.background = 'var(--bg)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeSection !== topic.id) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{topic.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600' }}>{topic.title}</div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8,
                      fontWeight: '500'
                    }}>
                      {topic.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--hair)',
            boxShadow: 'var(--shadow-md)',
            minHeight: '600px'
          }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
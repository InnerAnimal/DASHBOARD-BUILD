# AUTOMEAUXXX Pipeline Documentation
## Meauxbility AI-Powered Automation System

### Overview
AUTOMEAUXXX is Meauxbility's comprehensive automation pipeline that integrates Supabase database triggers with AI content generation to streamline donor, subscriber, and applicant communications while maintaining human oversight and brand consistency.

---

## 🏗️ System Architecture

### Core Components
1. **Database Schema** - Supabase tables with RLS security
2. **Trigger Functions** - Automated task creation on data events
3. **AI Content Generation** - Structured prompt/response management
4. **Human-in-the-Loop** - Review and approval workflow
5. **Efficiency Pipeline** - Continuous optimization and monitoring

---

## 📊 Database Schema

### `ai_content` Table
**Purpose:** Captures every AI-generated content piece for audit and optimization

```sql
CREATE TABLE ai_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  model text NOT NULL,                    -- 'gpt', 'claude', etc.
  prompt text NOT NULL,                   -- Input prompt
  output text,                           -- AI response (nullable)
  status text DEFAULT 'pending',         -- 'pending', 'processing', 'completed'
  updated_at timestamptz DEFAULT now()
);
```

**Key Features:**
- Row-level security enabled
- Full audit trail of AI interactions
- Status tracking for workflow management
- Model versioning for A/B testing

### `tasks` Table
**Purpose:** Queue system for all automation workflows

```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  task_type text NOT NULL,               -- Workflow identifier
  payload jsonb NOT NULL,                -- Context data
  status text DEFAULT 'pending',         -- Workflow status
  scheduled_at timestamptz,              -- Future processing
  updated_at timestamptz DEFAULT now()
);
```

**Task Types:**
- `new_subscriber_welcome`
- `new_donation_thank_you`
- `application_update`
- `donor_lifecycle_management`
- `re_engagement_campaign`

---

## ⚡ Trigger Functions

### 1. New Subscriber Handler
```sql
CREATE OR REPLACE FUNCTION handle_new_subscriber() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO tasks (task_type, payload, status)
  VALUES (
    'new_subscriber_welcome',
    jsonb_build_object(
      'subscription_id', NEW.id,
      'email', NEW.email,
      'first_name', NEW.first_name,
      'source', NEW.source,
      'interests', NEW.interests
    ),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

### 2. New Donation Handler
```sql
CREATE OR REPLACE FUNCTION handle_new_donation() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO tasks (task_type, payload, status)
  VALUES (
    'new_donation_thank_you',
    jsonb_build_object(
      'donation_id', NEW.id,
      'donor_id', NEW.donor_id,
      'amount', NEW.amount_gross,
      'campaign_id', NEW.campaign_id,
      'payment_method', NEW.payment_method
    ),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

### 3. Application Update Handler
```sql
CREATE OR REPLACE FUNCTION handle_application_update() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO tasks (task_type, payload, status)
  VALUES (
    'application_update',
    jsonb_build_object(
      'application_id', NEW.id,
      'full_name', NEW.full_name,
      'email', NEW.email,
      'program_type', NEW.program_type,
      'urgency_level', NEW.urgency_level,
      'financial_need', NEW.financial_need
    ),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

---

## 🤖 AI Content Dispatcher

### Central Dispatch Function
```sql
CREATE OR REPLACE FUNCTION dispatch_ai_task(task_id uuid) 
RETURNS void AS $$
DECLARE
  v_task tasks%ROWTYPE;
  v_prompt_template text;
  v_personalized_prompt text;
BEGIN
  SELECT * INTO v_task FROM tasks WHERE id = task_id;
  
  -- Generate personalized prompts based on task type
  IF v_task.task_type = 'new_subscriber_welcome' THEN
    v_prompt_template := 'Write a warm, empowering welcome email for Meauxbility. 
    Recipient: %s (%s)
    Context: New subscriber interested in mobility support
    Brand voice: Empowering, inclusive, transparent, supportive
    Include: Mission statement, resource overview, community invitation
    Length: 200-300 words
    CTA: "Explore Resources"';
    
    v_personalized_prompt := format(v_prompt_template, 
      v_task.payload->>'first_name', 
      v_task.payload->>'email'
    );
    
  ELSIF v_task.task_type = 'new_donation_thank_you' THEN
    v_prompt_template := 'Write a heartfelt thank-you email for a Meauxbility donation.
    Donor: %s
    Amount: $%s
    Campaign: %s
    Brand voice: Grateful, transparent, impact-focused
    Include: Specific impact, tax receipt info, community invitation
    Length: 150-250 words
    CTA: "Share Your Support"';
    
    v_personalized_prompt := format(v_prompt_template,
      v_task.payload->>'donor_id',
      v_task.payload->>'amount',
      v_task.payload->>'campaign_id'
    );
    
  ELSIF v_task.task_type = 'application_update' THEN
    v_prompt_template := 'Write an acknowledgment email for a Meauxbility application.
    Applicant: %s
    Program: %s
    Urgency: %s
    Brand voice: Supportive, transparent, hopeful
    Include: Confirmation, timeline, resources while waiting
    Length: 200-300 words
    CTA: "Access Resources"';
    
    v_personalized_prompt := format(v_prompt_template,
      v_task.payload->>'full_name',
      v_task.payload->>'program_type',
      v_task.payload->>'urgency_level'
    );
  END IF;
  
  -- Insert AI content request
  INSERT INTO ai_content (model, prompt, output, status)
  VALUES ('gpt-4', v_personalized_prompt, NULL, 'pending');
  
  -- Update task status
  UPDATE tasks SET status = 'processing' WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

---

## 🔄 Trigger Configuration

### Active Triggers
| Trigger Name | Table | Event | Function | Purpose |
|--------------|-------|-------|----------|---------|
| `new_subscriber_trigger` | `email_subscriptions` | AFTER INSERT | `handle_new_subscriber` | Welcome series initiation |
| `new_donation_trigger` | `donations` | AFTER INSERT | `handle_new_donation` | Thank-you automation |
| `new_application_trigger` | `applications` | AFTER INSERT | `handle_application_update` | Application acknowledgment |

### Trigger Setup Commands
```sql
-- Subscriber trigger
CREATE TRIGGER new_subscriber_trigger
  AFTER INSERT ON email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_new_subscriber();

-- Donation trigger  
CREATE TRIGGER new_donation_trigger
  AFTER INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION handle_new_donation();

-- Application trigger
CREATE TRIGGER new_application_trigger
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_application_update();
```

---

## 👥 Human-in-the-Loop Interface

### Review Dashboard Components

#### 1. AI Content Review Queue
```sql
-- View for pending AI content review
CREATE VIEW ai_content_review_queue AS
SELECT 
  ac.id,
  ac.created_at,
  ac.model,
  ac.prompt,
  ac.output,
  ac.status,
  t.task_type,
  t.payload
FROM ai_content ac
LEFT JOIN tasks t ON ac.id = t.id
WHERE ac.status = 'pending'
ORDER BY ac.created_at ASC;
```

#### 2. Task Monitoring Dashboard
```sql
-- View for task status monitoring
CREATE VIEW task_monitoring AS
SELECT 
  t.id,
  t.task_type,
  t.status,
  t.created_at,
  t.payload,
  ac.status as ai_status,
  ac.output as ai_output
FROM tasks t
LEFT JOIN ai_content ac ON t.id = ac.id
ORDER BY t.created_at DESC;
```

### Approval Workflow
1. **Review**: Staff reviews AI-generated content
2. **Edit**: Modify prompts or outputs as needed
3. **Approve**: Mark content as approved for sending
4. **Send**: Trigger email delivery via approved content
5. **Track**: Monitor delivery and engagement metrics

---

## 📈 Efficiency Pipeline

### Performance Metrics Dashboard
```sql
-- AI content performance metrics
CREATE VIEW ai_performance_metrics AS
SELECT 
  model,
  task_type,
  COUNT(*) as total_requests,
  AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completion_rate,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_time,
  COUNT(CASE WHEN output IS NOT NULL THEN 1 END) as successful_generations
FROM ai_content
GROUP BY model, task_type;
```

### Optimization Triggers
1. **Response Time Monitoring**: Track AI generation speed
2. **Quality Scoring**: Rate AI output quality (1-5 scale)
3. **Human Edit Frequency**: Track how often content needs modification
4. **Engagement Metrics**: Monitor email open/click rates by AI vs human content
5. **Cost Analysis**: Track AI API usage and costs per task type

### Continuous Improvement Process
1. **Weekly Reviews**: Analyze performance metrics
2. **Prompt Optimization**: Refine prompts based on quality scores
3. **A/B Testing**: Test different AI models and prompt variations
4. **Feedback Integration**: Incorporate human feedback into prompt templates
5. **Automation Expansion**: Identify new automation opportunities

---

## 🚀 Implementation Checklist

### Phase 1: Foundation (Completed ✅)
- [x] Database schema setup
- [x] Trigger functions created
- [x] AI content table structure
- [x] Task queue system
- [x] Basic dispatch function

### Phase 2: AI Integration (In Progress 🔄)
- [ ] External AI API integration (OpenAI/Anthropic)
- [ ] Prompt template library
- [ ] Content quality scoring system
- [ ] Automated content generation pipeline
- [ ] Error handling and retry logic

### Phase 3: Human Interface (Planned 📋)
- [ ] Review dashboard UI
- [ ] Approval workflow interface
- [ ] Content editing tools
- [ ] Bulk approval capabilities
- [ ] User role management

### Phase 4: Optimization (Planned 📋)
- [ ] Performance monitoring dashboard
- [ ] A/B testing framework
- [ ] Cost optimization tools
- [ ] Advanced analytics
- [ ] Machine learning integration

---

## 🔒 Security & Compliance

### Row-Level Security Policies
```sql
-- AI content access policy
CREATE POLICY "ai_content_access" ON ai_content
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role' OR auth.uid() IN (
    SELECT user_id FROM staff_permissions WHERE can_review_ai = true
  ));

-- Task access policy  
CREATE POLICY "task_access" ON tasks
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role' OR auth.uid() IN (
    SELECT user_id FROM staff_permissions WHERE can_manage_tasks = true
  ));
```

### Data Privacy Compliance
- **GDPR**: User consent tracking for AI-generated communications
- **CCPA**: Data deletion and opt-out capabilities
- **Audit Trail**: Complete logging of all AI interactions
- **Data Retention**: Configurable retention policies for AI content

---

## 📊 Success Metrics

### Key Performance Indicators
1. **Automation Rate**: % of communications handled by AI
2. **Human Edit Rate**: % of AI content requiring human modification
3. **Response Time**: Average time from trigger to content generation
4. **Quality Score**: Average human rating of AI-generated content
5. **Engagement Rate**: Email open/click rates by content source
6. **Cost Efficiency**: Cost per automated communication vs manual

### Target Benchmarks
- **Automation Rate**: >80% of routine communications
- **Human Edit Rate**: <20% of AI-generated content
- **Response Time**: <5 minutes for content generation
- **Quality Score**: >4.0/5.0 average rating
- **Engagement Rate**: Match or exceed manual content performance
- **Cost Efficiency**: 60% reduction in communication costs

---

## 🔧 Maintenance & Updates

### Regular Maintenance Tasks
- **Weekly**: Review performance metrics and optimize prompts
- **Monthly**: Update AI models and test new capabilities
- **Quarterly**: Comprehensive system audit and security review
- **Annually**: Full system architecture review and upgrade planning

### Version Control
- **Schema Changes**: Documented in migration files
- **Function Updates**: Versioned with rollback capabilities
- **Prompt Templates**: Git-tracked with change history
- **Configuration**: Environment-specific settings management

---

## 📞 Support & Troubleshooting

### Common Issues
1. **Trigger Not Firing**: Check RLS policies and function permissions
2. **AI Content Not Generating**: Verify API keys and rate limits
3. **Performance Degradation**: Monitor database query performance
4. **Content Quality Issues**: Review and update prompt templates

### Monitoring & Alerts
- **Error Rate Monitoring**: Alert on high failure rates
- **Performance Monitoring**: Track response times and throughput
- **Cost Monitoring**: Alert on unexpected API usage spikes
- **Quality Monitoring**: Flag content with low quality scores

---

*This documentation is maintained as part of the AUTOMEAUXXX pipeline and should be updated with each system enhancement.*

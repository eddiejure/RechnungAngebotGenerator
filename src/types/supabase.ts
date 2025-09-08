export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      company_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          is_default: boolean
          company_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          is_default?: boolean
          company_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          is_default?: boolean
          company_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      line_item_templates: {
        Row: {
          id: string
          user_id: string
          description: string
          unit_price: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          unit_price?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          unit_price?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_type_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          category: string
          estimated_duration: number
          base_price: number
          technologies: string[]
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          category: string
          estimated_duration?: number
          base_price?: number
          technologies?: string[]
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          category?: string
          estimated_duration?: number
          base_price?: number
          technologies?: string[]
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_phase_templates: {
        Row: {
          id: string
          user_id: string
          project_type_template_id: string | null
          name: string
          description: string
          order_index: number
          estimated_hours: number
          estimated_days: number
          dependencies: string[]
          deliverables: string[]
          is_optional: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_type_template_id?: string | null
          name: string
          description: string
          order_index: number
          estimated_hours?: number
          estimated_days?: number
          dependencies?: string[]
          deliverables?: string[]
          is_optional?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_type_template_id?: string | null
          name?: string
          description?: string
          order_index?: number
          estimated_hours?: number
          estimated_days?: number
          dependencies?: string[]
          deliverables?: string[]
          is_optional?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string | null
          email: string
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string
          website: string | null
          industry: string | null
          contact_person: string | null
          notes: string
          total_projects: number
          total_revenue: number
          last_project: string | null
          next_follow_up: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company?: string | null
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          website?: string | null
          industry?: string | null
          contact_person?: string | null
          notes?: string
          total_projects?: number
          total_revenue?: number
          last_project?: string | null
          next_follow_up?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          website?: string | null
          industry?: string | null
          contact_person?: string | null
          notes?: string
          total_projects?: number
          total_revenue?: number
          last_project?: string | null
          next_follow_up?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string | null
          email: string
          phone: string | null
          source: string
          status: string
          priority: string
          estimated_value: number | null
          notes: string
          last_contact: string | null
          next_follow_up: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company?: string | null
          email: string
          phone?: string | null
          source?: string
          status?: string
          priority?: string
          estimated_value?: number | null
          notes?: string
          last_contact?: string | null
          next_follow_up?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company?: string | null
          email?: string
          phone?: string | null
          source?: string
          status?: string
          priority?: string
          estimated_value?: number | null
          notes?: string
          last_contact?: string | null
          next_follow_up?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          name: string
          type: string
          status: string
          priority: string
          payment_type: string
          monthly_price: number | null
          setup_fee: number | null
          budget: number
          progress: number
          description: string
          technologies: string[]
          domain: string | null
          hosting_provider: string | null
          start_date: string
          end_date: string | null
          deadline: string | null
          launch_date: string | null
          maintenance_included: boolean
          seo_included: boolean
          content_management: boolean
          responsive_design: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id: string
          name: string
          type?: string
          status?: string
          priority?: string
          payment_type?: string
          monthly_price?: number | null
          setup_fee?: number | null
          budget?: number
          progress?: number
          description?: string
          technologies?: string[]
          domain?: string | null
          hosting_provider?: string | null
          start_date: string
          end_date?: string | null
          deadline?: string | null
          launch_date?: string | null
          maintenance_included?: boolean
          seo_included?: boolean
          content_management?: boolean
          responsive_design?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string
          name?: string
          type?: string
          status?: string
          priority?: string
          payment_type?: string
          monthly_price?: number | null
          setup_fee?: number | null
          budget?: number
          progress?: number
          description?: string
          technologies?: string[]
          domain?: string | null
          hosting_provider?: string | null
          start_date?: string
          end_date?: string | null
          deadline?: string | null
          launch_date?: string | null
          maintenance_included?: boolean
          seo_included?: boolean
          content_management?: boolean
          responsive_design?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_phases: {
        Row: {
          id: string
          user_id: string
          project_id: string
          name: string
          description: string
          status: string
          order_index: number
          start_date: string | null
          end_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          name: string
          description?: string
          status?: string
          order_index: number
          start_date?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          name?: string
          description?: string
          status?: string
          order_index?: number
          start_date?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          customer_id: string | null
          project_id: string | null
          type: string
          document_number: string
          date: string
          due_date: string | null
          customer_data: Json
          company_data: Json
          is_small_business: boolean
          notes: string
          subtotal: number
          vat_amount: number
          total: number
          letter_subject: string | null
          letter_content: string | null
          letter_greeting: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id?: string | null
          project_id?: string | null
          type: string
          document_number: string
          date: string
          due_date?: string | null
          customer_data: Json
          company_data: Json
          is_small_business?: boolean
          notes?: string
          subtotal?: number
          vat_amount?: number
          total?: number
          letter_subject?: string | null
          letter_content?: string | null
          letter_greeting?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string | null
          project_id?: string | null
          type?: string
          document_number?: string
          date?: string
          due_date?: string | null
          customer_data?: Json
          company_data?: Json
          is_small_business?: boolean
          notes?: string
          subtotal?: number
          vat_amount?: number
          total?: number
          letter_subject?: string | null
          letter_content?: string | null
          letter_greeting?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      document_line_items: {
        Row: {
          id: string
          user_id: string
          document_id: string
          position: number
          description: string
          quantity: number
          unit_price: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id: string
          position: number
          description: string
          quantity?: number
          unit_price?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_id?: string
          position?: number
          description?: string
          quantity?: number
          unit_price?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      project_documents: {
        Row: {
          id: string
          user_id: string
          project_id: string
          document_id: string | null
          name: string
          type: string
          url: string | null
          size_bytes: number | null
          notes: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          document_id?: string | null
          name: string
          type?: string
          url?: string | null
          size_bytes?: number | null
          notes?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          document_id?: string | null
          name?: string
          type?: string
          url?: string | null
          size_bytes?: number | null
          notes?: string | null
          uploaded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
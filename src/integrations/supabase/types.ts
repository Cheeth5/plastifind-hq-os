export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          event: string | null
          evidence: string | null
          id: string
          location: string | null
          product_id: string | null
          result: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          event?: string | null
          evidence?: string | null
          id?: string
          location?: string | null
          product_id?: string | null
          result?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          event?: string | null
          evidence?: string | null
          id?: string
          location?: string | null
          product_id?: string | null
          result?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string | null
          entity_label: string | null
          id: string
          updated_at: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity?: string | null
          entity_label?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string | null
          entity_label?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          actual: number | null
          created_at: string
          funding_source: string | null
          id: string
          name: string
          period: string | null
          planned: number | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          actual?: number | null
          created_at?: string
          funding_source?: string | null
          id?: string
          name: string
          period?: string | null
          planned?: number | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          actual?: number | null
          created_at?: string
          funding_source?: string | null
          id?: string
          name?: string
          period?: string | null
          planned?: number | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_canvas: {
        Row: {
          canvas: string
          content: string | null
          created_at: string
          id: string
          section: string
          updated_at: string
        }
        Insert: {
          canvas: string
          content?: string | null
          created_at?: string
          id?: string
          section: string
          updated_at?: string
        }
        Update: {
          canvas?: string
          content?: string | null
          created_at?: string
          id?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          entity_id: string
          entity_table: string
          id: string
          mentions: string[]
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          entity_id: string
          entity_table: string
          id?: string
          mentions?: string[]
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          entity_id?: string
          entity_table?: string
          id?: string
          mentions?: string[]
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          address: string | null
          commercial_name: string
          cover_url: string | null
          created_at: string
          creation_date: string | null
          email: string | null
          founder_story: string | null
          github: string | null
          goals_1y: string | null
          goals_3y: string | null
          goals_5y: string | null
          id: string
          instagram: string | null
          legal_name: string
          legal_structure: string | null
          linkedin: string | null
          logo_url: string | null
          mission: string | null
          phone: string | null
          siren: string | null
          siret: string | null
          status: string | null
          tagline: string | null
          updated_at: string
          vision: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          commercial_name?: string
          cover_url?: string | null
          created_at?: string
          creation_date?: string | null
          email?: string | null
          founder_story?: string | null
          github?: string | null
          goals_1y?: string | null
          goals_3y?: string | null
          goals_5y?: string | null
          id?: string
          instagram?: string | null
          legal_name?: string
          legal_structure?: string | null
          linkedin?: string | null
          logo_url?: string | null
          mission?: string | null
          phone?: string | null
          siren?: string | null
          siret?: string | null
          status?: string | null
          tagline?: string | null
          updated_at?: string
          vision?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          commercial_name?: string
          cover_url?: string | null
          created_at?: string
          creation_date?: string | null
          email?: string | null
          founder_story?: string | null
          github?: string | null
          goals_1y?: string | null
          goals_3y?: string | null
          goals_5y?: string | null
          id?: string
          instagram?: string | null
          legal_name?: string
          legal_structure?: string | null
          linkedin?: string | null
          logo_url?: string | null
          mission?: string | null
          phone?: string | null
          siren?: string | null
          siret?: string | null
          status?: string | null
          tagline?: string | null
          updated_at?: string
          vision?: string | null
          website?: string | null
        }
        Relationships: []
      }
      competitions: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string
          date: string | null
          eligibility: string | null
          id: string
          location: string | null
          name: string
          objectives: string | null
          organization: string | null
          registration_deadline: string | null
          result: string | null
          robot: string | null
          status: string | null
          team: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string
          date?: string | null
          eligibility?: string | null
          id?: string
          location?: string | null
          name: string
          objectives?: string | null
          organization?: string | null
          registration_deadline?: string | null
          result?: string | null
          robot?: string | null
          status?: string | null
          team?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string
          date?: string | null
          eligibility?: string | null
          id?: string
          location?: string | null
          name?: string
          objectives?: string | null
          organization?: string | null
          registration_deadline?: string | null
          result?: string | null
          robot?: string | null
          status?: string | null
          team?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      competitors: {
        Row: {
          company: string
          country: string | null
          created_at: string
          id: string
          notes: string | null
          price: string | null
          product: string | null
          segment: string | null
          strengths: string | null
          technology: string | null
          updated_at: string
          weaknesses: string | null
          website: string | null
        }
        Insert: {
          company: string
          country?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: string | null
          product?: string | null
          segment?: string | null
          strengths?: string | null
          technology?: string | null
          updated_at?: string
          weaknesses?: string | null
          website?: string | null
        }
        Update: {
          company?: string
          country?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: string | null
          product?: string | null
          segment?: string | null
          strengths?: string | null
          technology?: string | null
          updated_at?: string
          weaknesses?: string | null
          website?: string | null
        }
        Relationships: []
      }
      components: {
        Row: {
          alternative: string | null
          availability: string | null
          category: string | null
          created_at: string
          datasheet_url: string | null
          id: string
          lead_time: string | null
          name: string
          power_consumption: number | null
          product_id: string | null
          quantity: number
          reference: string | null
          status: string | null
          supplier: string | null
          unit_price: number
          updated_at: string
          version: string | null
          weight: number | null
        }
        Insert: {
          alternative?: string | null
          availability?: string | null
          category?: string | null
          created_at?: string
          datasheet_url?: string | null
          id?: string
          lead_time?: string | null
          name: string
          power_consumption?: number | null
          product_id?: string | null
          quantity?: number
          reference?: string | null
          status?: string | null
          supplier?: string | null
          unit_price?: number
          updated_at?: string
          version?: string | null
          weight?: number | null
        }
        Update: {
          alternative?: string | null
          availability?: string | null
          category?: string | null
          created_at?: string
          datasheet_url?: string | null
          id?: string
          lead_time?: string | null
          name?: string
          power_consumption?: number | null
          product_id?: string | null
          quantity?: number
          reference?: string | null
          status?: string | null
          supplier?: string | null
          unit_price?: number
          updated_at?: string
          version?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          last_interaction: string | null
          linkedin: string | null
          next_action: string | null
          notes: string | null
          organization_id: string | null
          organization_name: string | null
          owner: string | null
          phone: string | null
          role: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          last_interaction?: string | null
          linkedin?: string | null
          next_action?: string | null
          notes?: string | null
          organization_id?: string | null
          organization_name?: string | null
          owner?: string | null
          phone?: string | null
          role?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          last_interaction?: string | null
          linkedin?: string | null
          next_action?: string | null
          notes?: string | null
          organization_id?: string | null
          organization_name?: string | null
          owner?: string | null
          phone?: string | null
          role?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          archived: boolean
          conversation_id: string
          created_at: string
          favorite: boolean
          id: string
          last_read_at: string
          muted: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          conversation_id: string
          created_at?: string
          favorite?: boolean
          id?: string
          last_read_at?: string
          muted?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          conversation_id?: string
          created_at?: string
          favorite?: boolean
          id?: string
          last_read_at?: string
          muted?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          project_id: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          project_id?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          project_id?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Relationships: []
      }
      decisions: {
        Row: {
          alternatives: string | null
          chosen: string | null
          consequences: string | null
          context: string | null
          created_at: string
          date: string | null
          id: string
          owner: string | null
          product_id: string | null
          rationale: string | null
          title: string
          updated_at: string
        }
        Insert: {
          alternatives?: string | null
          chosen?: string | null
          consequences?: string | null
          context?: string | null
          created_at?: string
          date?: string | null
          id?: string
          owner?: string | null
          product_id?: string | null
          rationale?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          alternatives?: string | null
          chosen?: string | null
          consequences?: string | null
          context?: string | null
          created_at?: string
          date?: string | null
          id?: string
          owner?: string | null
          product_id?: string | null
          rationale?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          confidentiality: string
          created_at: string
          file_url: string | null
          id: string
          notes: string | null
          owner: string | null
          product_id: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          category?: string
          confidentiality?: string
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          product_id?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string
          confidentiality?: string
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          product_id?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engineering_records: {
        Row: {
          author: string | null
          created_at: string
          decision: string | null
          discipline: string
          doc_type: string
          file_url: string | null
          id: string
          notes: string | null
          product_id: string | null
          project_id: string | null
          related_component: string | null
          related_requirement: string | null
          status: string
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          decision?: string | null
          discipline?: string
          doc_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          project_id?: string | null
          related_component?: string | null
          related_requirement?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          decision?: string | null
          discipline?: string
          doc_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          project_id?: string | null
          related_component?: string | null
          related_requirement?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineering_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineering_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          payment_method: string | null
          product_id: string | null
          project_id: string | null
          receipt_url: string | null
          reimbursable: boolean | null
          status: string | null
          supplier: string | null
          tax: number | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          reimbursable?: boolean | null
          status?: string | null
          supplier?: string | null
          tax?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          reimbursable?: boolean | null
          status?: string | null
          supplier?: string | null
          tax?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_opportunities: {
        Row: {
          amount: number | null
          checklist: Json
          company_required: boolean | null
          created_at: string
          deadline: string | null
          eligibility: string | null
          equity_required: boolean | null
          id: string
          link: string | null
          max_amount: number | null
          min_amount: number | null
          next_action: string | null
          notes: string | null
          organization: string | null
          owner: string | null
          probability: number | null
          program_name: string
          prototype_required: boolean | null
          region: string | null
          repayment_required: boolean | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          checklist?: Json
          company_required?: boolean | null
          created_at?: string
          deadline?: string | null
          eligibility?: string | null
          equity_required?: boolean | null
          id?: string
          link?: string | null
          max_amount?: number | null
          min_amount?: number | null
          next_action?: string | null
          notes?: string | null
          organization?: string | null
          owner?: string | null
          probability?: number | null
          program_name: string
          prototype_required?: boolean | null
          region?: string | null
          repayment_required?: boolean | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          checklist?: Json
          company_required?: boolean | null
          created_at?: string
          deadline?: string | null
          eligibility?: string | null
          equity_required?: boolean | null
          id?: string
          link?: string | null
          max_amount?: number | null
          min_amount?: number | null
          next_action?: string | null
          notes?: string | null
          organization?: string | null
          owner?: string | null
          probability?: number | null
          program_name?: string
          prototype_required?: boolean | null
          region?: string | null
          repayment_required?: boolean | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_roles: {
        Row: {
          candidate: string | null
          created_at: string
          department: string | null
          id: string
          notes: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          candidate?: string | null
          created_at?: string
          department?: string | null
          id?: string
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          candidate?: string | null
          created_at?: string
          department?: string | null
          id?: string
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_items: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          kind: string
          notes: string | null
          owner: string | null
          sort_order: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          kind?: string
          notes?: string | null
          owner?: string | null
          sort_order?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          kind?: string
          notes?: string | null
          owner?: string | null
          sort_order?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_posts: {
        Row: {
          caption: string | null
          created_at: string
          date: string | null
          format: string | null
          id: string
          link: string | null
          metrics: string | null
          objective: string | null
          platform: string | null
          product_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          date?: string | null
          format?: string | null
          id?: string
          link?: string | null
          metrics?: string | null
          objective?: string | null
          platform?: string | null
          product_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          date?: string | null
          format?: string | null
          id?: string
          link?: string | null
          metrics?: string | null
          objective?: string | null
          platform?: string | null
          product_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_posts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          file_url: string | null
          id: string
          is_public: boolean | null
          product_id: string | null
          source: string | null
          tags: string[] | null
          title: string
          updated_at: string
          usage_rights: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          product_id?: string | null
          source?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          usage_rights?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          product_id?: string | null
          source?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          usage_rights?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_actions: {
        Row: {
          action: string
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          meeting_id: string
          owner: string | null
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          meeting_id: string
          owner?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          meeting_id?: string
          owner?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_actions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          contact_id: string | null
          created_at: string
          date: string
          decisions: string | null
          id: string
          next_meeting: string | null
          notes: string | null
          objective: string | null
          organization: string | null
          participants: string | null
          preparation_status: string | null
          project_id: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          agenda?: string | null
          contact_id?: string | null
          created_at?: string
          date?: string
          decisions?: string | null
          id?: string
          next_meeting?: string | null
          notes?: string | null
          objective?: string | null
          organization?: string | null
          participants?: string | null
          preparation_status?: string | null
          project_id?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          agenda?: string | null
          contact_id?: string | null
          created_at?: string
          date?: string
          decisions?: string | null
          id?: string
          next_meeting?: string | null
          notes?: string | null
          objective?: string | null
          organization?: string | null
          participants?: string | null
          preparation_status?: string | null
          project_id?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_path: string | null
          attachment_type: string | null
          body: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          mentions: string[]
          parent_id: string | null
          pinned: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_type?: string | null
          body?: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: string[]
          parent_id?: string | null
          pinned?: boolean
          updated_at?: string
          user_id?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_type?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: string[]
          parent_id?: string | null
          pinned?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          category: string
          created_at: string
          date: string | null
          dependencies: string | null
          evidence: string | null
          horizon: string | null
          id: string
          owner: string | null
          progress: number
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          date?: string | null
          dependencies?: string | null
          evidence?: string | null
          horizon?: string | null
          id?: string
          owner?: string | null
          progress?: number
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string | null
          dependencies?: string | null
          evidence?: string | null
          horizon?: string | null
          id?: string
          owner?: string | null
          progress?: number
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          kind: string | null
          link: string | null
          priority: string
          read: boolean
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          kind?: string | null
          link?: string | null
          priority?: string
          read?: boolean
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          kind?: string | null
          link?: string | null
          priority?: string
          read?: boolean
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          relationship: string | null
          relevance: string | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          relationship?: string | null
          relevance?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          relationship?: string | null
          relevance?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          code_name: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          expected_launch: string | null
          id: string
          image_url: string | null
          name: string
          owner: string | null
          privacy_note: string | null
          progress: number
          progress_detail: Json
          stage: string | null
          status: string | null
          target_price: number | null
          target_users: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code_name?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          expected_launch?: string | null
          id?: string
          image_url?: string | null
          name: string
          owner?: string | null
          privacy_note?: string | null
          progress?: number
          progress_detail?: Json
          stage?: string | null
          status?: string | null
          target_price?: number | null
          target_users?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code_name?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          expected_launch?: string | null
          id?: string
          image_url?: string | null
          name?: string
          owner?: string | null
          privacy_note?: string | null
          progress?: number
          progress_detail?: Json
          stage?: string | null
          status?: string | null
          target_price?: number | null
          target_users?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          company_role: string | null
          created_at: string
          date_of_birth: string | null
          disabled: boolean
          email: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          job_role: string | null
          last_name: string | null
          last_seen_at: string | null
          locale: string
          onboarding_completed: boolean
          presence_status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          company_role?: string | null
          created_at?: string
          date_of_birth?: string | null
          disabled?: boolean
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          job_role?: string | null
          last_name?: string | null
          last_seen_at?: string | null
          locale?: string
          onboarding_completed?: boolean
          presence_status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          company_role?: string | null
          created_at?: string
          date_of_birth?: string | null
          disabled?: boolean
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          job_role?: string | null
          last_name?: string | null
          last_seen_at?: string | null
          locale?: string
          onboarding_completed?: boolean
          presence_status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          id: string
          name: string
          objective: string | null
          owner: string | null
          priority: string
          product_id: string | null
          progress: number
          start_date: string | null
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          id?: string
          name: string
          objective?: string | null
          owner?: string | null
          priority?: string
          product_id?: string | null
          progress?: number
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          id?: string
          name?: string
          objective?: string | null
          owner?: string | null
          priority?: string
          product_id?: string | null
          progress?: number
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          product_id: string | null
          ref: string
          related_component: string | null
          source: string | null
          status: string | null
          title: string
          updated_at: string
          verification: string | null
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          product_id?: string | null
          ref: string
          related_component?: string | null
          source?: string | null
          status?: string | null
          title: string
          updated_at?: string
          verification?: string | null
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          product_id?: string | null
          ref?: string
          related_component?: string | null
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          verification?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      research_notes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          date: string | null
          file_url: string | null
          id: string
          key_insight: string | null
          link: string | null
          product_id: string | null
          relevance: string | null
          source: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          date?: string | null
          file_url?: string | null
          id?: string
          key_insight?: string | null
          link?: string | null
          product_id?: string | null
          relevance?: string | null
          source?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          date?: string | null
          file_url?: string | null
          id?: string
          key_insight?: string | null
          link?: string | null
          product_id?: string | null
          relevance?: string | null
          source?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_notes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          category: string | null
          created_at: string
          id: string
          impact: number
          mitigation: string | null
          owner: string | null
          probability: number
          product_id: string | null
          project_id: string | null
          review_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          impact?: number
          mitigation?: string | null
          owner?: string | null
          probability?: number
          product_id?: string | null
          project_id?: string | null
          review_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          impact?: number
          mitigation?: string | null
          owner?: string | null
          probability?: number
          product_id?: string | null
          project_id?: string | null
          review_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_effort: number | null
          assignee: string | null
          category: string | null
          checklist: Json
          created_at: string
          deadline: string | null
          description: string | null
          estimated_effort: number | null
          id: string
          name: string
          notes: string | null
          priority: string
          product_id: string | null
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_effort?: number | null
          assignee?: string | null
          category?: string | null
          checklist?: Json
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_effort?: number | null
          id?: string
          name: string
          notes?: string | null
          priority?: string
          product_id?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_effort?: number | null
          assignee?: string | null
          category?: string | null
          checklist?: Json
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_effort?: number | null
          id?: string
          name?: string
          notes?: string | null
          priority?: string
          product_id?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          availability: string | null
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          skills: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          skills?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          skills?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tests: {
        Row: {
          actual_result: string | null
          created_at: string
          date: string | null
          environment: string | null
          evidence: string | null
          expected_result: string | null
          id: string
          notes: string | null
          procedure: string | null
          product_id: string | null
          ref: string | null
          requirement_ref: string | null
          responsible: string | null
          status: string | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          actual_result?: string | null
          created_at?: string
          date?: string | null
          environment?: string | null
          evidence?: string | null
          expected_result?: string | null
          id?: string
          notes?: string | null
          procedure?: string | null
          product_id?: string | null
          ref?: string | null
          requirement_ref?: string | null
          responsible?: string | null
          status?: string | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          actual_result?: string | null
          created_at?: string
          date?: string | null
          environment?: string | null
          evidence?: string | null
          expected_result?: string | null
          id?: string
          notes?: string | null
          procedure?: string | null
          product_id?: string | null
          ref?: string | null
          requirement_ref?: string | null
          responsible?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      university_items: {
        Row: {
          course: string | null
          created_at: string
          date: string | null
          hours: number | null
          id: string
          notes: string | null
          status: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          course?: string | null
          created_at?: string
          date?: string | null
          hours?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          course?: string | null
          created_at?: string
          date?: string | null
          hours?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          last_seen_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      my_permissions: {
        Args: never
        Returns: {
          permission: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "engineering"
        | "business"
        | "mentor"
        | "viewer"
        | "founder"
        | "administrator"
        | "software_dev"
        | "ai_engineer"
        | "designer"
        | "marketing"
        | "finance"
        | "operations"
        | "intern"
        | "engineer"
        | "software_developer"
        | "business_developer"
      conversation_type: "dm" | "group" | "channel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "engineering",
        "business",
        "mentor",
        "viewer",
        "founder",
        "administrator",
        "software_dev",
        "ai_engineer",
        "designer",
        "marketing",
        "finance",
        "operations",
        "intern",
        "engineer",
        "software_developer",
        "business_developer",
      ],
      conversation_type: ["dm", "group", "channel"],
    },
  },
} as const

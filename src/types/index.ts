export type UserRole = 'administrateur' | 'operateur' | 'consultant'

export interface Utilisateur {
  id_utilisateur: number
  nom: string
  prenom: string
  email: string
  role: UserRole
  statut: boolean
  derniere_connexion?: string
  ip_derniere_connexion?: string
}

export interface Categorie {
  id_categorie: number
  nom: string
  description?: string
  articles_count?: number
}

export interface Entrepot {
  id_entrepot: number
  nom: string
  adresse?: string
  ville?: string
  responsable?: string
  statut: boolean
  stocks_count?: number
  emplacements?: Emplacement[]
  stocks?: Stock[]
}

export interface Emplacement {
  id_emplacement: number
  id_entrepot: number
  libelle: string
  description?: string
}

export interface Article {
  id_article: number
  id_categorie?: number
  code: string
  designation: string
  unite_mesure?: string
  description?: string
  stock_total?: number
  categorie?: Categorie
  stocks?: Stock[]
}

export interface Stock {
  id_stock: number
  id_article: number
  id_entrepot: number
  quantite: number
  seuil_min?: number
  seuil_max?: number
  statut_label?: string
  article?: Article
  entrepot?: Entrepot
}

export interface Mouvement {
  id_mouvement: number
  id_article: number
  id_entrepot_source?: number
  id_entrepot_destination?: number
  id_utilisateur: number
  type: 'entree' | 'sortie' | 'transfert'
  quantite: number
  motif?: string
  reference_doc?: string
  statut: 'en_attente' | 'valide' | 'rejete'
  horodatage: string
  article?: Article
  entrepot_source?: Entrepot
  entrepot_destination?: Entrepot
  utilisateur?: Utilisateur
}

export interface Alerte {
  id_alerte: number
  id_stock: number
  type: 'rupture' | 'seuil_min' | 'seuil_max'
  message?: string
  statut: 'active' | 'resolue'
  date_declenchement: string
  date_resolution?: string
  stock?: Stock
}

export interface AuditLog {
  id_log: number
  id_utilisateur?: number
  action: string
  table_cible?: string
  id_enregistrement?: number
  details_json?: { before?: Record<string, unknown>; after?: Record<string, unknown> }
  ip_utilisateur?: string
  horodatage: string
  utilisateur?: Utilisateur
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  meta?: {
    pagination?: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
}

export interface DashboardData {
  kpis: {
    total_articles_stock: number
    active_movements_today: number
    active_alerts: number
    total_warehouses: number
  }
  stock_evolution: Array<{ date: string; net: number }>
  top_articles: Array<{ article: string; total: number }>
  movement_breakdown: Record<string, number>
  recent_movements: Mouvement[]
  active_alerts: Array<Alerte & { article?: string; entrepot?: string }>
}

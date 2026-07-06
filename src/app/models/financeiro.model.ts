export interface Usuario {
  id: number;
  nome: string; // Mantido 'nome' combinando com o recurso do Laravel acima
  email: string;
  role: 'admin' | 'gestor' | 'diretor';
}


export interface AuthResposta {
  status: string;
  token: string;
  usuario: Usuario;
}

export interface Categoria {
  id: number;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  created_at?: string;
  updated_at?: string;
}

export interface FormaPagamento {
  id: number;
  nome: string;
  created_at?: string;
  updated_at?: string;
}

export interface Receita {
  id: number;
  valor: number;
  data: string;
  descricao?: string;
  categoria?: string;
  forma_pagamento?: string;
  registado_por?: string;
}

export interface Despesa {
  id: number;
  valor: number;
  data: string;
  fornecedor?: string;
  descricao?: string;
  categoria?: string;
  forma_pagamento?: string;
  registado_por?: string;
}


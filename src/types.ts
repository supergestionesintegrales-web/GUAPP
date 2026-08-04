export interface Subsubmodulo {
  id: string;
  nombre: string;
  url: string;
  desc?: string;
  orden?: number;
}

export interface Submodulo {
  id: string;
  moduloId?: string;
  nombre: string;
  desc: string;
  url: string;
  color: string;
  icono: string;
  sublinks: Subsubmodulo[];
  orden?: number;
}

export interface Modulo {
  id: string;
  nombre: string;
  submodulos: Submodulo[];
  orden?: number;
}

export interface Noticia {
  id: string;
  tipo: 'noticia' | 'novedad' | 'evento' | string;
  titulo: string;
  descripcion: string;
  fecha?: string;
  imagenFileId?: string;
  imagenURL?: string;
  creadoPor?: string;
  fechaCreacion?: string;
}

export interface OpenTab {
  id: string;
  nombre: string;
  url: string;
  isExternal?: boolean;
  linkData?: Partial<Submodulo>;
}

export type UserRole = 'PUBLIC' | 'ADMIN' | null;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categories.api";

// En useQuery: Se usa para saber si los datos se están cargando por primera vez.

// En useMutation: Se suele llamar isPending (en las versiones más recientes), y sirve para saber si se está creando/editando algo en ese momento.

/*
A. useQuery (El Lector)
Imagina que es un bibliotecario inteligente. Su único trabajo es traer información (GET).

¿Qué hace? Ejecuta tu función getCategories, guarda el resultado en una memoria caché y te da estados (isLoading, isError, data).

La clave: Si dos componentes usan useCategories, el bibliotecario no va a la API dos veces; saca la información de su "bolsillo" (caché) y se la da a ambos.

B. useMutation (El Escritor)
Es el encargado de hacer cambios (POST, PUT, DELETE).

¿Qué hace? Se usa cuando quieres alterar datos en el servidor. A diferencia de useQuery, no se ejecuta en cuanto carga el componente; tú tienes que dispararlo (por ejemplo, al hacer clic en un botón "Guardar").

C. QueryClient (El Cerebro/Caché)
Es el lugar central donde se guarda toda la información que has descargado de la API.

Cuando usas queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }), le estás diciendo al cerebro: "Oye, acabo de borrar una categoría, así que la lista que tienes guardada ya no sirve. Bórrala y vuelve a pedir la lista actualizada".
*/

export const CATEGORIES_KEY = "categories";

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: getCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success("Categoría creada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success("Categoría actualizada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success("Categoría eliminada correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

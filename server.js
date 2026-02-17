import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// conectar a Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// endpoint compatible con Platzi API
app.get('/products', async (req, res) => {

  const { categoryId } = req.query;

let query = supabase
  .from('productos')
  .select(`
    id,
    nombre,
    price,
    description,
    categorias (
      id,
      nombre
    ),
    producto_imagenes (
      url
    )
  `);

  if (categoryId) {
    query = query.eq('categoria_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json(error);
  }

  const formatted = (data || []).map(p => ({
  id: p.id,
  title: p.nombre,
  price: p.price || 0,
  description: p.description || "",
  images: p.producto_imagenes?.map(img => img.url) || [],
  creationAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  category: {
    id: p.categorias?.id,
    nombre: p.categorias?.nombre
  }
}));

  res.json(formatted);
});

app.get('/categories', async (req, res) => {

  const { data, error } = await supabase
    .from('categorias')
    .select('*');

  if (error) {
    return res.status(500).json(error);
  }

  const formatted = (data || []).map(c => ({
    id: c.id,
    nombre: c.nombre,
    image: ""
  }));

  res.json(formatted);
});



app.get('/products/:id', async (req, res) => {

  const { id } = req.params;

  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      price,
      description,
      categorias (
        id,
        nombre
      ),
      producto_imagenes (
        url
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json(error);
  }

  const formatted = {
    id: data.id,
    title: data.nombre,
    price: data.price || 0,
    description: data.description || "",
    images: data.producto_imagenes?.map(img => img.url) || [],
    category: {
      id: data.categorias?.id,
      nombre: data.categorias?.nombre
    }
  };

  res.json(formatted);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
})
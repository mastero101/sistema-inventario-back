// Transformar de snake_case (DB) a camelCase (Frontend)
exports.transformToCamelCase = (item) => {
  if (!item) return null;
  
  return {
    id: item.id,
    tipo: item.tipo,
    marca: item.marca,
    modelo: item.modelo,
    serial: item.serial,
    estado: item.estado,
    asignadoA: item.asignado_a,
    ubicacion: item.ubicacion,
    fechaRegistro: item.fecha_registro instanceof Date 
      ? item.fecha_registro.toISOString().split('T')[0] 
      : item.fecha_registro,
    ultimoMantenimiento: item.ultimo_mantenimiento instanceof Date 
      ? item.ultimo_mantenimiento.toISOString().split('T')[0] 
      : item.ultimo_mantenimiento,
    departamento: item.departamento,
    imagen: item.imagen
  };
};

// Transformar de camelCase (Frontend) a snake_case (DB)
exports.transformToSnakeCase = (item) => {
  if (!item) return null;
  
  return {
    id: item.id,
    tipo: item.tipo,
    marca: item.marca,
    modelo: item.modelo,
    serial: item.serial,
    estado: item.estado,
    asignado_a: item.asignadoA,
    ubicacion: item.ubicacion,
    fecha_registro: item.fechaRegistro,
    ultimo_mantenimiento: item.ultimoMantenimiento,
    departamento: item.departamento,
    imagen: item.imagen
  };
};

// Transformar una lista de items
exports.transformListToCamelCase = (items) => {
  return items.map(item => exports.transformToCamelCase(item));
};
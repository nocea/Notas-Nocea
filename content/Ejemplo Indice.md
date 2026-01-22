# Ejemplo de Nota con Índice

Esta es una nota de ejemplo diseñada para probar el nuevo sistema de **Índice Interactivo** (Table of Contents).

# 1. ¿Qué es?

Este componente extrae automáticamente los encabezados `H1`, `H2` y `H3` de tu nota y genera un menú de navegación a la derecha.

# 2. Los 3 Pilares Fundamentales

Para que el aprendizaje sea efectivo, nos basamos en:

## A. La Entidad (Entity)

Define la estructura de los datos que manejamos en nuestra aplicación.

## B. El Contexto (DbContext)

Actúa como puente entre nuestra aplicación y la base de datos.

## C. La Configuración (Dependency Injection)

Permite gestionar las dependencias de forma eficiente y limpia.

# 3. Operaciones Principales (CRUD)

Aquí detallamos cómo interactuar con los datos:

- **Create**: Crear nuevos registros.
- **Read**: Consultar información existente.
- **Update**: Modificar datos actuales.
- **Delete**: Eliminar registros que ya no son necesarios.

# 4. Patrón de Uso Correcto (Arquitectura)

Es vital seguir una arquitectura limpia para que el proyecto sea mantenible a largo plazo.

# 5. Conceptos Avanzados que tocamos

- Unit of Work
- Repository Pattern
- AutoMapper

📝 Tu "Snippet" de código para Servicios:

```csharp
public class BaseService<T> : IBaseService<T> where T : class
{
    protected readonly DbContext _context;
    public BaseService(DbContext context) => _context = context;
}
```

from django.http import HttpResponse
from portfolio.models import Project, Experience

def home(request):
    projects = Project.objects.all()
    experiences = Experience.objects.all()
    html = """
    <div style='font-family:sans-serif;background:linear-gradient(135deg,#0f2027,#2c5364);min-height:100vh;padding:40px;color:white;'>
      <h1 style='font-size:2.5rem;margin-bottom:1rem;text-align:center;'>Bienvenido al Backend del Portafolio</h1>
      <h2 style='font-size:1.5rem;margin-bottom:2rem;text-align:center;'>Cleider Perez</h2>
      <div style='max-width:900px;margin:0 auto;'>
        <h3 style='margin-top:2rem;font-size:1.3rem;'>Resumen de Proyectos</h3>
        <table style='width:100%;margin-bottom:2rem;background:#1a2233;border-radius:8px;overflow:hidden;'>
          <thead><tr style='background:#22304a;'><th style='padding:8px'>Título</th><th>Descripción</th><th>Enlace</th></tr></thead>
          <tbody>"""
    for p in projects:
        html += f"<tr><td style='padding:8px'>{p.title}</td><td>{p.description[:60]}...</td><td>{f'<a href=\"{p.link}\" style=\"color:#90cdf4\" target=\"_blank\">Ver</a>' if p.link else '-'}</td></tr>"
    html += """</tbody></table>
        <h3 style='margin-top:2rem;font-size:1.3rem;'>Resumen de Experiencia</h3>
        <table style='width:100%;background:#1a2233;border-radius:8px;overflow:hidden;'>
          <thead><tr style='background:#22304a;'><th style='padding:8px'>Cargo</th><th>Empresa</th><th>Inicio</th><th>Fin</th></tr></thead>
          <tbody>"""
    for e in experiences:
        html += f"<tr><td style='padding:8px'>{e.position}</td><td>{e.company}</td><td>{e.start_date}</td><td>{e.end_date or 'Actualidad'}</td></tr>"
    html += """</tbody></table>
      </div>
      <div style='text-align:center;margin-top:2rem;'>
        <a href='/api/' style='color:#90cdf4;font-size:1.2rem;text-decoration:underline;margin-right:2rem;'>Ver endpoints de la API</a>
        <a href='/admin/' style='color:#fbbf24;font-size:1.2rem;text-decoration:underline;'>Ir al panel de administración</a>
      </div>
      <footer style='margin-top:2rem;font-size:0.9rem;color:#cbd5e1;text-align:center;'>Desarrollado con Django + DRF</footer>
    </div>
    """
    return HttpResponse(html)
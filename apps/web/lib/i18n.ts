export const supportedLocales = ["es", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export const LOCALE_COOKIE_NAME = "instantreport-locale";

const localeTags: Record<Locale, string> = {
  es: "es-MX",
  en: "en-US"
};

const dictionaries = {
  es: {
    common: {
      appName: "InstantReport",
      languageLabel: "Idioma",
      languageOptions: {
        es: "Español",
        en: "English"
      },
      notSet: "Sin registrar",
      notProvided: "Sin dato",
      notAssigned: "Sin asignar",
      openFile: "Abrir archivo"
    },
    roles: {
      REQUESTER: "Solicitante",
      TECHNICIAN: "Técnico",
      ADMIN: "Administrador",
      requester: "Solicitante",
      technician: "Técnico",
      admin: "Administrador"
    },
    ticketStatus: {
      OPEN: "Abierto",
      ASSIGNED: "Asignado",
      IN_PROGRESS: "En proceso",
      PENDING_USER: "Pendiente del usuario",
      RESOLVED: "Resuelto",
      CLOSED: "Cerrado",
      PUBLIC: "Comentario público",
      INTERNAL_NOTE: "Nota interna",
      RESOLUTION_NOTE: "Nota de resolución",
      LOW: "Baja",
      MEDIUM: "Media",
      HIGH: "Alta",
      URGENT: "Urgente"
    },
    auth: {
      login: {
        heroKicker: "InstantReport",
        heroTitle: "Mesa de ayuda interna clara, rápida y fácil de seguir.",
        heroCopy:
          "Pensada para equipos internos que necesitan tickets ordenados, evidencia fotográfica y seguimiento sin una plataforma pesada.",
        highlights: ["Línea de tiempo", "Adjuntos", "Historial de estados"],
        cardEyebrow: "Acceso interno",
        cardTitle: "Ingresa con tu correo de la empresa",
        cardCopy:
          "Usa tu cuenta interna para entrar al portal de soporte y continuar con tus tickets.",
        emailLabel: "Correo",
        emailPlaceholder: "nombre@empresa.com",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "••••••••",
        submit: "Entrar",
        submitting: "Entrando...",
        forgotPassword: "¿Olvidaste tu contraseña?",
        resetWithToken: "¿Ya tienes un token de recuperación?",
        footerNote: "¿Solo quieres ver la app actual?",
        footerLink: "Entrar al portal"
      }
    },
    appShell: {
      title: "Portal de soporte",
      subtitle:
        "Un espacio simple para registrar incidencias, dar seguimiento y resolverlas sin perder contexto.",
      nav: {
        tickets: "Mis tickets",
        newTicket: "Nuevo ticket",
        allTickets: "Todos los tickets",
        users: "Usuarios",
        categories: "Categorías"
      },
      logout: "Salir",
      loggingOut: "Saliendo..."
    },
    tickets: {
      list: {
        kicker: "Mis tickets",
        title: "Solicitudes creadas por mí o asignadas a mí.",
        action: "Nuevo ticket",
        emptyEyebrow: "Sin tickets",
        emptyTitle: "Tus solicitudes aparecerán aquí.",
        justNow: "Ahora mismo"
      },
      create: {
        pageKicker: "Nueva solicitud",
        pageTitle: "Describe el problema una sola vez y deja que el flujo haga el resto.",
        pageCopy:
          "Un buen título, la categoría correcta y evidencia útil ayudan a que soporte responda más rápido y cierre mejor cada caso.",
        statTitles: {
          titles: "Mejores títulos",
          evidence: "Mejor evidencia",
          outcome: "Mejor resultado"
        },
        statBodies: {
          titles: "Problema breve más ubicación o equipo.",
          evidence: "Capturas, fotos y PDFs de hasta 10 MB.",
          outcome: "Mejor triage, mejor cierre y mejor historial."
        },
        formKicker: "Crear ticket",
        formTitle: "Captura el problema con el contexto suficiente para actuar.",
        formCopy:
          "Escribe una descripción clara, elige la categoría adecuada y adjunta fotos o capturas si ayudan a reproducir el problema.",
        fields: {
          title: "Título",
          category: "Categoría",
          priority: "Prioridad",
          location: "Ubicación",
          assetTag: "Activo",
          attachments: "Adjuntos",
          description: "Descripción"
        },
        placeholders: {
          title: "La impresora de finanzas no funciona",
          location: "Oficina de RH, segundo piso",
          assetTag: "PC-1042",
          description:
            "Describe qué ocurre, qué intentaste y desde cuándo empezó."
        },
        attachmentHint:
          "Opcional. Agrega capturas, fotos o PDFs de hasta 10 MB por archivo.",
        create: "Crear ticket",
        creating: "Creando ticket...",
        createdLabel: "Ticket creado",
        createdCopy:
          "La solicitud ya está en el sistema. Continúa desde el detalle para evitar duplicados."
      },
      detail: {
        backToMyTickets: "Volver a mis tickets",
        backToQueue: "Volver a la cola",
        kicker: "Detalle del ticket",
        heroDescription:
          "Todo el caso en un solo lugar: problema, evidencia y conversación, con una vista más simple para actuar rápido.",
        facts: {
          requester: "Solicitante",
          assigned: "Asignado",
          category: "Categoría",
          updated: "Actualizado",
          status: "Estado"
        },
        summaryLabel: "Resumen",
        summaryTitle: "Qué está pasando",
        resolutionSummary: "Resumen de solución",
        contextLabel: "Contexto",
        contextTitle: "Datos clave",
        fields: {
          priority: "Prioridad",
          created: "Creado",
          assignedTo: "Asignado a",
          location: "Ubicación",
          assetTag: "Activo"
        },
        evidenceLabel: "Evidencia",
        evidenceTitle: "Adjuntos",
        noAttachments: "Todavía no hay adjuntos en este ticket.",
        conversationLabel: "Conversación",
        commentsTitle: "Comentarios",
        noComments:
          "Aún no hay comentarios públicos. Agrega contexto nuevo si el equipo lo necesita.",
        historyLabel: "Historial",
        historyTitle: "Cambios de estado",
        noHistory: "Todavía no hay cambios de estado registrados.",
        uploadedBy: "Subido por",
        movedFromTo: "Cambió de {from} a {to}.",
        movedTo: "Cambió a {to}."
      },
      attachmentForm: {
        kicker: "Adjuntos",
        title: "Agregar evidencia",
        description:
          "Sube imágenes o un PDF para dejar un registro claro de lo que se observó.",
        accepted: "Aceptado",
        acceptedValue: "Imágenes y PDFs",
        chooseFiles: "Elegir archivos",
        chooseFilesHint:
          "PNG, JPG, JPEG, HEIC, HEIF o PDF. Puedes seleccionar varios a la vez.",
        selectedFiles: "Archivos seleccionados",
        unknownType: "Tipo desconocido",
        helper:
          "Los archivos se suben uno por uno para mostrar claramente el primer error del servidor.",
        upload: "Subir adjuntos",
        uploading: "Subiendo...",
        success: "Adjuntos cargados correctamente.",
        error: {
          upload: "No fue posible cargar los adjuntos por ahora.",
          singleFile: "No fue posible cargar {file}."
        }
      },
      commentForm: {
        kicker: "Agregar contexto",
        titleStaff: "Agregar nota al ticket",
        titleRequester: "Agregar comentario público",
        noteVisibility: "Visibilidad",
        noteVisibilityHelp:
          "Las notas internas no se muestran al solicitante. Las notas de resolución sí quedan visibles en el historial.",
        placeholders: {
          staff:
            "Escribe detalles de diagnóstico, una actualización para el usuario o el contexto final de la solución.",
          requester:
            "Comparte información nueva, confirma una prueba o responde la pregunta del equipo."
        },
        submitComment: "Publicar comentario",
        postingComment: "Publicando nota...",
        error: "No fue posible agregar tu comentario.",
        reachServer: "No fue posible comunicarse con el servidor."
      },
      staffActions: {
        headerKicker: "Consola operativa",
        headerTitle: "Acciones del equipo",
        headerCopy:
          "Mantén la propiedad, el estado y el cierre en un solo lugar para que el historial siga claro.",
        access: "Acceso {role}",
        stats: {
          owner: "Responsable",
          updated: "Actualizado",
          comments: "Comentarios",
          evidence: "Evidencia"
        },
        assignment: {
          eyebrowAdmin: "Asignación",
          eyebrowTechnician: "Propiedad",
          titleAdmin: "Asignar ticket",
          titleTechnician: "Tomar ticket",
          descriptionAdmin:
            "Elige al responsable actual y deja una nota breve de traspaso.",
          descriptionTechnician:
            "Toma este ticket para ti y deja una nota breve de traspaso.",
          labelAdmin: "Asignar a",
          labelTechnician: "Responsable",
          emptyNone: "No hay usuarios disponibles",
          emptyAdmin: "Elige un técnico o administrador",
          emptyTechnician: "Asignarme este ticket",
          handoffNote: "Nota de traspaso",
          handoffPlaceholder: "Contexto opcional para la siguiente persona.",
          helperClosed:
            "Los tickets resueltos o cerrados deben reabrirse antes de cambiar de responsable.",
          helperAdmin:
            "La asignación cambia la propiedad sin perder el historial existente.",
          helperTechnician:
            "Los técnicos pueden tomar tickets para sí mismos; los administradores pueden distribuirlos en el equipo.",
          saveAdmin: "Guardar asignación",
          saveTechnician: "Tomar ticket",
          saving: "Guardando asignación...",
          assignError: "No fue posible asignar el ticket.",
          serverError: "No fue posible comunicarse con el servidor."
        },
        lifecycle: {
          eyebrow: "Ciclo",
          title: "Actualizar estado",
          description:
            "Mueve el ticket entre trabajo activo, espera o reapertura limpia.",
          noteLabel: "Nota de estado",
          notePlaceholder:
            "Explica por qué cambió el estado o cuál es el siguiente paso.",
          reopenReason: "Motivo de reapertura",
          reopenPlaceholder:
            "Obligatorio si el ticket resuelto o cerrado vuelve a trabajo activo.",
          helper: "El estado seleccionado es {status}.",
          save: "Guardar estado",
          saving: "Guardando estado...",
          error: "No fue posible actualizar el estado.",
          serverError: "No fue posible comunicarse con el servidor."
        },
        closeout: {
          eyebrow: "Cierre",
          title: "Documentar la solución",
          description:
            "Registra la solución final antes de marcar el ticket como resuelto o cerrado.",
          target: "Estado de cierre",
          currentState: "Estado actual",
          resolutionSummary: "Resumen de solución",
          resolutionPlaceholder:
            "Resume la solución con un lenguaje que el solicitante pueda entender.",
          closeoutNote: "Nota de cierre",
          closeoutPlaceholder:
            "Contexto interno opcional para el historial.",
          reopenReason: "Motivo de reapertura",
          reopenPlaceholder:
            "Obligatorio cuando un ticket cerrado se reabre hacia resuelto.",
          helper:
            "Cerrar requiere un resumen de solución; reabrir un ticket cerrado requiere un motivo.",
          save: "Guardar cierre",
          saving: "Guardando cierre...",
          error: "No fue posible guardar el cierre.",
          serverError: "No fue posible comunicarse con el servidor."
        }
      }
    }
  },
  en: {
    common: {
      appName: "InstantReport",
      languageLabel: "Language",
      languageOptions: {
        es: "Español",
        en: "English"
      },
      notSet: "Not set",
      notProvided: "Not provided",
      notAssigned: "Unassigned",
      openFile: "Open file"
    },
    roles: {
      REQUESTER: "Requester",
      TECHNICIAN: "Technician",
      ADMIN: "Admin",
      requester: "Requester",
      technician: "Technician",
      admin: "Admin"
    },
    ticketStatus: {
      OPEN: "Open",
      ASSIGNED: "Assigned",
      IN_PROGRESS: "In progress",
      PENDING_USER: "Pending user",
      RESOLVED: "Resolved",
      CLOSED: "Closed",
      PUBLIC: "Public comment",
      INTERNAL_NOTE: "Internal note",
      RESOLUTION_NOTE: "Resolution note",
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      URGENT: "Urgent"
    },
    auth: {
      login: {
        heroKicker: "InstantReport",
        heroTitle: "Internal help desk intake that feels clear, quick, and easy to follow.",
        heroCopy:
          "Built for internal teams that need orderly tickets, photo evidence, and follow-through without a heavy platform.",
        highlights: ["Timeline", "Attachments", "Status history"],
        cardEyebrow: "Internal access",
        cardTitle: "Sign in with your company email",
        cardCopy:
          "Use your internal account to enter the support portal and continue working through tickets.",
        emailLabel: "Email",
        emailPlaceholder: "name@company.com",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••",
        submit: "Sign in",
        submitting: "Signing in...",
        forgotPassword: "Forgot your password?",
        resetWithToken: "Already have a reset token?",
        footerNote: "Just want to see the current app?",
        footerLink: "Enter the portal"
      }
    },
    appShell: {
      title: "Support portal",
      subtitle:
        "A simple place to log issues, follow them through, and resolve them without losing context.",
      nav: {
        tickets: "My tickets",
        newTicket: "New ticket",
        allTickets: "All tickets",
        users: "Users",
        categories: "Categories"
      },
      logout: "Sign out",
      loggingOut: "Signing out..."
    },
    tickets: {
      list: {
        kicker: "My tickets",
        title: "Requests created by me or assigned to me.",
        action: "New ticket",
        emptyEyebrow: "No tickets yet",
        emptyTitle: "Your submitted requests will appear here.",
        justNow: "Just now"
      },
      create: {
        pageKicker: "New request",
        pageTitle: "Document the issue once and let the workflow carry the rest.",
        pageCopy:
          "A strong title, the right category, and useful evidence help support respond faster and close each case more cleanly.",
        statTitles: {
          titles: "Best titles",
          evidence: "Best evidence",
          outcome: "Best outcome"
        },
        statBodies: {
          titles: "Short problem statement plus location or device.",
          evidence: "Screenshots, photos, and PDFs up to 10 MB.",
          outcome: "Cleaner triage, cleaner closure, cleaner history."
        },
        formKicker: "Create ticket",
        formTitle: "Capture the issue with enough context to act.",
        formCopy:
          "Keep the request clear, choose the right category, and attach photos or screenshots if they help reproduce the problem.",
        fields: {
          title: "Title",
          category: "Category",
          priority: "Priority",
          location: "Location",
          assetTag: "Asset tag",
          attachments: "Attachments",
          description: "Description"
        },
        placeholders: {
          title: "Finance printer is offline",
          location: "HR office, second floor",
          assetTag: "PC-1042",
          description:
            "Describe what is happening, what you tried, and when it started."
        },
        attachmentHint:
          "Optional. Add screenshots, photos, or PDFs up to 10 MB each.",
        create: "Create ticket",
        creating: "Creating ticket...",
        createdLabel: "Ticket created",
        createdCopy:
          "The request is already in the system. Continue from the detail page to avoid duplicates."
      },
      detail: {
        backToMyTickets: "Back to my tickets",
        backToQueue: "Back to queue",
        kicker: "Ticket detail",
        heroDescription:
          "Keep the issue, evidence, and conversation in one place with a calmer view that makes the next action obvious.",
        facts: {
          requester: "Requester",
          assigned: "Assigned",
          category: "Category",
          updated: "Updated",
          status: "Status"
        },
        summaryLabel: "Summary",
        summaryTitle: "What is happening",
        resolutionSummary: "Resolution summary",
        contextLabel: "Context",
        contextTitle: "Key details",
        fields: {
          priority: "Priority",
          created: "Created",
          assignedTo: "Assigned to",
          location: "Location",
          assetTag: "Asset tag"
        },
        evidenceLabel: "Evidence",
        evidenceTitle: "Attachments",
        noAttachments: "No attachments have been added to this ticket yet.",
        conversationLabel: "Conversation",
        commentsTitle: "Comments",
        noComments:
          "No public comments yet. Add new context if the support team needs it.",
        historyLabel: "History",
        historyTitle: "Status history",
        noHistory: "No status transitions have been recorded yet.",
        uploadedBy: "Uploaded by",
        movedFromTo: "Moved from {from} to {to}.",
        movedTo: "Moved to {to}."
      },
      attachmentForm: {
        kicker: "Attachments",
        title: "Add evidence",
        description:
          "Upload images or a PDF so the ticket keeps a clear record of what was seen.",
        accepted: "Accepted",
        acceptedValue: "Images and PDFs",
        chooseFiles: "Choose files",
        chooseFilesHint:
          "PNG, JPG, JPEG, HEIC, HEIF, or PDF. Select one or many at once.",
        selectedFiles: "Selected files",
        unknownType: "Unknown type",
        helper:
          "Files upload one by one so the first server error stays clear.",
        upload: "Upload attachments",
        uploading: "Uploading...",
        success: "Attachment upload complete.",
        error: {
          upload: "Unable to upload attachments right now.",
          singleFile: "Unable to upload {file}."
        }
      },
      commentForm: {
        kicker: "Add context",
        titleStaff: "Add a ticket note",
        titleRequester: "Leave a public comment",
        noteVisibility: "Visibility",
        noteVisibilityHelp:
          "Internal notes stay hidden from requesters. Resolution notes remain visible in the history.",
        placeholders: {
          staff:
            "Capture troubleshooting details, a user-facing update, or the final resolution context.",
          requester:
            "Share new information, confirm a test, or answer the support team's question."
        },
        submitComment: "Post comment",
        postingComment: "Posting note...",
        error: "Unable to add your comment.",
        reachServer: "Unable to reach the server right now."
      },
      staffActions: {
        headerKicker: "Operations console",
        headerTitle: "Team actions",
        headerCopy:
          "Keep ownership, status, and close-out together so the record stays clear.",
        access: "{role} access",
        stats: {
          owner: "Owner",
          updated: "Updated",
          comments: "Comments",
          evidence: "Evidence"
        },
        assignment: {
          eyebrowAdmin: "Assignment",
          eyebrowTechnician: "Ownership",
          titleAdmin: "Assign the ticket",
          titleTechnician: "Claim the ticket",
          descriptionAdmin:
            "Choose the current owner and capture a short handoff note.",
          descriptionTechnician:
            "Claim this ticket for yourself and capture a short handoff note.",
          labelAdmin: "Assign to",
          labelTechnician: "Owner",
          emptyNone: "No assignable users supplied",
          emptyAdmin: "Choose a technician or admin",
          emptyTechnician: "Assign this ticket to me",
          handoffNote: "Handoff note",
          handoffPlaceholder: "Optional context for the next teammate.",
          helperClosed:
            "Resolved and closed tickets must be reopened before ownership can change.",
          helperAdmin:
            "Assignment moves ownership without losing the existing history.",
          helperTechnician:
            "Technicians can claim tickets for themselves while admins can route them across the team.",
          saveAdmin: "Save assignment",
          saveTechnician: "Claim ticket",
          saving: "Saving assignment...",
          assignError: "Unable to assign the ticket.",
          serverError: "Unable to reach the server right now."
        },
        lifecycle: {
          eyebrow: "Lifecycle",
          title: "Update the status",
          description:
            "Move the ticket through active work, waiting states, or a clean reopen.",
          noteLabel: "Status note",
          notePlaceholder:
            "Capture why the status changed or what the next step is.",
          reopenReason: "Reopen reason",
          reopenPlaceholder:
            "Required if this resolved or closed ticket is moving back into active work.",
          helper: "The selected state is {status}.",
          save: "Save status",
          saving: "Saving status...",
          error: "Unable to update workflow status.",
          serverError: "Unable to reach the server right now."
        },
        closeout: {
          eyebrow: "Close-out",
          title: "Write the resolution",
          description:
            "Capture the final fix before marking the ticket resolved or closed.",
          target: "Close-out target",
          currentState: "Current state",
          resolutionSummary: "Resolution summary",
          resolutionPlaceholder:
            "Summarize the fix in language the requester can understand.",
          closeoutNote: "Close-out note",
          closeoutPlaceholder: "Optional internal context for the audit trail.",
          reopenReason: "Reopen reason",
          reopenPlaceholder:
            "Required when reopening a closed ticket back into resolved work.",
          helper:
            "Closing requires a resolution summary; reopening a closed ticket requires a reason.",
          save: "Save close-out",
          saving: "Saving close-out...",
          error: "Unable to save the close-out details.",
          serverError: "Unable to reach the server right now."
        }
      }
    }
  }
} as const;

export type AppDictionary = (typeof dictionaries)[Locale];

export function isSupportedLocale(value?: string | null): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getDictionary(locale: Locale): AppDictionary {
  return dictionaries[locale];
}

export function getLocaleTag(locale: Locale) {
  return localeTags[locale];
}

export function formatDateTime(locale: Locale, value: string | null) {
  if (!value) {
    return getDictionary(locale).common.notSet;
  }

  return new Intl.DateTimeFormat(getLocaleTag(locale), {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(getLocaleTag(locale), {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function formatRelativeDate(locale: Locale, input: string) {
  const date = new Date(input);
  const delta = date.getTime() - Date.now();
  const minutes = Math.round(delta / 60000);
  const dictionary = getDictionary(locale);

  if (Math.abs(minutes) < 1) {
    return dictionary.tickets.list.justNow;
  }

  const formatter = new Intl.RelativeTimeFormat(getLocaleTag(locale), {
    numeric: "auto"
  });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) {
    return formatter.format(days, "day");
  }

  return formatDate(locale, input);
}

export function translateStatus(locale: Locale, value: string) {
  const dictionary = getDictionary(locale);
  return (
    dictionary.ticketStatus[value as keyof typeof dictionary.ticketStatus] ??
    value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function translateRole(locale: Locale, value?: string | null) {
  const dictionary = getDictionary(locale);

  if (!value) {
    return dictionary.roles.technician;
  }

  return dictionary.roles[value as keyof typeof dictionary.roles] ?? value;
}

export function interpolate(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? `{${key}}`)
  );
}

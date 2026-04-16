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
      openFile: "Abrir archivo",
      active: "Activo",
      inactive: "Inactivo",
      never: "Nunca",
      allStatuses: "Todos los estados",
      clearFilters: "Limpiar filtros"
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
      },
      forgotPassword: {
        heroKicker: "Recuperación",
        heroTitle: "Solicita un token de acceso sin salir del flujo interno.",
        heroCopy:
          "Por ahora este MVP devuelve un token temporal directamente, mientras el envío por correo sigue pendiente.",
        highlights: ["Token temporal", "Sin registro público", "Acceso interno"],
        cardEyebrow: "Recuperación",
        cardTitle: "Solicitar token",
        cardCopy:
          "Escribe tu correo de la empresa. Si la cuenta existe, el sistema iniciará la recuperación y mostrará el token temporal en esta versión local.",
        emailLabel: "Correo",
        emailPlaceholder: "nombre@empresa.com",
        submit: "Solicitar recuperación",
        submitting: "Generando token...",
        footerNote: "¿Ya lo recordaste?",
        footerLink: "Volver a entrar",
        statusLabel: "Estado",
        defaultMessage:
          "Si la cuenta existe, se generó un token de recuperación.",
        tokenLabel: "Token",
        expiresLabel: "Vence {date}",
        continueLabel: "Continuar al cambio de contraseña",
        localOnlyNote:
          "Cuando el envío por correo esté listo, el token dejará de mostrarse en la respuesta y llegará por fuera.",
        genericError: "No fue posible iniciar la recuperación.",
        serverError: "No fue posible comunicarse con el servidor."
      },
      resetPassword: {
        heroKicker: "Recuperación",
        heroTitle: "Define una nueva contraseña y vuelve al portal.",
        heroCopy:
          "Pega el token de recuperación, elige una nueva contraseña y regresa al flujo normal de tickets.",
        highlights: ["Mínimo 8 caracteres", "Validación de token", "Regreso rápido"],
        cardEyebrow: "Nueva contraseña",
        cardTitle: "Completar recuperación",
        cardCopy:
          "Esta pantalla usa el mismo endpoint de backend que usará el flujo por correo cuando esté listo.",
        footerNote: "¿Necesitas un token primero?",
        footerLink: "Solicítalo aquí",
        tokenLabel: "Token",
        tokenPlaceholder: "Pega el token del paso anterior",
        passwordLabel: "Nueva contraseña",
        passwordPlaceholder: "Mínimo 8 caracteres",
        confirmLabel: "Confirmar contraseña",
        confirmPlaceholder: "Repite la nueva contraseña",
        hintEmpty: "Usa al menos 8 caracteres.",
        hintShort: "La nueva contraseña debe tener al menos 8 caracteres.",
        hintReady: "La nueva contraseña está lista para guardarse.",
        mismatch: "Las contraseñas deben coincidir.",
        successLabel: "Contraseña actualizada",
        successDefault: "La contraseña se actualizó correctamente.",
        successAction: "Volver a entrar",
        submit: "Actualizar contraseña",
        submitting: "Actualizando contraseña...",
        genericError: "No fue posible actualizar la contraseña.",
        serverError: "No fue posible comunicarse con el servidor."
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
    },
    dashboard: {
      kickerStaff: "Panel operativo",
      kickerRequester: "Mi panel",
      titleStaff:
        "Revisa la carga, el ritmo de respuesta y lo que necesita atención primero.",
      titleRequester:
        "Da seguimiento a tus solicitudes sin perder el historial completo.",
      copyStaff:
        "Un resumen simple del flujo vivo para detectar carga, urgencia y categorías repetidas sin abrir cada caso.",
      copyRequester:
        "Aquí ves qué solicitudes siguen activas, cuáles esperan respuesta tuya y dónde hubo movimiento reciente.",
      createTicket: "Nuevo ticket",
      openQueue: "Abrir cola",
      reviewTickets: "Ver mis tickets",
      metricsStaff: {
        activeWork: "Trabajo activo",
        waitingOnUser: "En espera del usuario",
        resolvedThisWeek: "Resueltos esta semana",
        urgentTickets: "Urgentes"
      },
      metricsRequester: {
        openMine: "Mis abiertos",
        inProgress: "En proceso",
        waitingOnMe: "Esperando mi respuesta",
        resolvedThisWeek: "Resueltos esta semana"
      },
      workflowLabel: "Flujo",
      workflowTitle: "Distribución por estado",
      ticketsInView: "{count} tickets visibles",
      signalLabel: "Señales",
      signalTitle: "Indicadores clave",
      averageFirstResponse: "Primera respuesta promedio",
      ticketsWithEvidence: "Tickets con evidencia",
      topCategory: "Categoría principal",
      noDataYet: "Sin datos todavía",
      trendsEmpty: "Las tendencias aparecerán cuando existan más tickets.",
      recentLabel: "Actividad reciente",
      recentTitleStaff: "Últimos movimientos de la cola",
      recentTitleRequester: "Últimos cambios en mis tickets",
      recentEmpty:
        "Todavía no hay actividad. Crea el primer ticket para iniciar el historial.",
      coverageLabel: "Cobertura",
      coverageTitle: "Directorio",
      activeUsers: "Usuarios activos",
      staffSeats: "Personal operativo",
      admins: "Administradores",
      catalogLabel: "Catálogo",
      catalogTitle: "Cobertura de categorías",
      activeCategories: "Categorías activas",
      inactiveCategories: "Categorías inactivas",
      liveLeaders: "Categorías líderes",
      notAvailable: "N/D"
    },
    admin: {
      tickets: {
        roleTechnician: "Cola técnica",
        roleAdmin: "Cola administrativa",
        title: "Mantén la cola en movimiento sin perder el historial.",
        noteTechnician:
          "{count} tickets esperan atención del equipo. Atiende primero lo bloqueado o urgente.",
        noteAdmin:
          "{count} tickets siguen activos en la organización. Ordena por urgencia, antigüedad y bloqueo.",
        openRequester: "Abrir vista del solicitante",
        actionTechnician: "Tomar siguiente ticket",
        actionAdmin: "Asignar desde la cola",
        activeWork: "Trabajo activo",
        activeWorkHelp:
          "Tickets en proceso o esperando respuesta dentro de la cola visible.",
        urgent: "Urgentes",
        inProgress: "En proceso",
        resolved: "Resueltos",
        closed: "Cerrados",
        snapshotLabel: "Vista de cola",
        snapshotTitle:
          "Prioriza los casos que están envejeciendo, bloqueados o escalando.",
        showingResults:
          "Mostrando {shown} de {total} tickets. {active} siguen contando como trabajo activo.",
        searchLabel: "Buscar en la cola",
        searchPlaceholder: "Ticket, solicitante, departamento o responsable",
        statusLabel: "Estado",
        quickFilters: {
          all: "Todos",
          urgent: "Urgentes",
          needs_response: "Sin primera respuesta",
          with_attachments: "Con adjuntos"
        },
        emptyNone: "No hay tickets en la cola",
        emptyNoneTitle: "Todo está al corriente por ahora.",
        emptyNoneCopy:
          "Cuando llegue una solicitud, aparecerá aquí con prioridad, estado y último movimiento.",
        emptyFiltered: "Ningún ticket coincide con los filtros",
        emptyFilteredTitle: "Amplía los filtros de la cola.",
        emptyFilteredCopy:
          "Busca por solicitante, responsable o número de ticket para volver a ver más resultados.",
        requester: "Solicitante",
        department: "Departamento",
        assignee: "Responsable",
        response: "Respuesta",
        openTicket: "Abrir ticket",
        awaitingFirstResponse: "Sin primera respuesta"
      },
      users: {
        heroKicker: "Admin",
        heroTitle: "Gestiona identidades internas sin romper el historial.",
        heroCopy:
          "Los usuarios controlan acceso, asignación y visibilidad. Mantén roles y estado activos al día.",
        directorySize: "Tamaño del directorio",
        directorySizeHelp:
          "Todas las cuentas internas gestionadas por el sistema.",
        activeUsers: "Usuarios activos",
        staffRoles: "Roles operativos",
        createLabel: "Crear cuenta",
        createTitle: "Dar de alta sin salir del panel",
        createHelp:
          "Los nuevos usuarios se crean en el mismo directorio que usa el flujo de tickets.",
        fields: {
          fullName: "Nombre completo",
          email: "Correo",
          password: "Contraseña",
          department: "Departamento",
          role: "Rol"
        },
        placeholders: {
          fullName: "Ava Johnson",
          email: "ava@company.com",
          password: "Mínimo 8 caracteres",
          department: "Finanzas, Soporte u Operaciones"
        },
        accessNoteTitle: "Nota de acceso",
        accessNote:
          "Los solicitantes crean tickets. Técnicos y administradores pueden atender y asignar.",
        createAction: "Crear usuario",
        creatingAction: "Creando usuario...",
        directoryLabel: "Directorio",
        directoryTitle:
          "Mantén nombres, roles y estado alineados con el backend.",
        admins: "Administradores",
        technicians: "Técnicos",
        empty: "No hay usuarios todavía. Crea la primera cuenta arriba.",
        department: "Departamento",
        lastLogin: "Último acceso",
        updated: "Actualizado",
        activeAccount: "Cuenta activa",
        cardHelp:
          "Las contraseñas se administran desde el alta. Los cambios de estado y rol actualizan el mismo registro del backend.",
        saveAction: "Guardar cambios",
        savingAction: "Guardando...",
        requiredError:
          "Nombre completo, correo y contraseña son obligatorios.",
        updateNameError: "El nombre no puede estar vacío.",
        createError: "No fue posible crear el usuario.",
        createServerError: "No fue posible comunicarse con el servidor.",
        updateError: "No fue posible actualizar el usuario.",
        updateServerError: "No fue posible comunicarse con el servidor.",
        createSuccess: "Se creó {name}.",
        updateSuccess: "Se guardaron los cambios de {name}."
      },
      categories: {
        heroKicker: "Admin",
        heroTitle: "Mantén el catálogo limpio y listo para captura.",
        heroCopy:
          "Las categorías afectan ruteo, reportes y calidad de captura. Mantén la lista simple y clara.",
        totalCategories: "Categorías totales",
        activeCategories: "Categorías activas",
        inactiveCategories: "Categorías inactivas",
        libraryLabel: "Biblioteca",
        libraryTitle: "Categorías disponibles",
        libraryCopy:
          "Edita el catálogo aquí y deja que el formulario de tickets herede los cambios.",
        createLabel: "Crear categoría",
        createTitle: "Nueva etiqueta",
        createCopy:
          "Usa nombres breves y fáciles de entender para quien reporta.",
        editLabel: "Editar categoría",
        editTitle: "Categoría seleccionada",
        editCopy:
          "Actualiza la entrada actual o retírala sin borrar tickets históricos.",
        fields: {
          name: "Nombre",
          description: "Descripción",
          editing: "Editando",
          status: "Estado"
        },
        placeholders: {
          name: "Ejemplo: Acceso a software",
          description: "Texto corto de ayuda para el formulario."
        },
        createAction: "Crear categoría",
        creatingAction: "Creando...",
        saveAction: "Guardar cambios",
        savingAction: "Guardando...",
        optionalDescription:
          "Opcional. Déjala vacía si el nombre ya es suficientemente claro.",
        requesterDescription:
          "El solicitante verá este texto cuando la categoría esté disponible.",
        keepAvailable: "Mantener disponible en creación de tickets",
        emptyLibraryTitle: "No hay categorías todavía",
        emptyLibraryCopy:
          "Usa el formulario para agregar la primera categoría.",
        emptySelectedTitle: "Selecciona una categoría",
        emptySelectedCopy: "Haz clic en Editar para cargarla aquí.",
        activeBadge: "Visible en captura",
        inactiveBadge: "Oculta en captura",
        noDescription: "Sin descripción.",
        editAction: "Editar",
        selectedAction: "Seleccionada",
        createError: "No fue posible crear la categoría.",
        createServerError: "No fue posible comunicarse con el servidor.",
        updateError: "No fue posible actualizar la categoría.",
        updateServerError: "No fue posible comunicarse con el servidor.",
        createSuccess: "Se creó {name}.",
        updateSuccess: "Se actualizó {name}.",
        createdAt: "Creada {date}",
        updatedAt: "Actualizada {date}"
      }
    },
    routeState: {
      appErrorKicker: "Algo falló",
      appErrorTitle: "El espacio de trabajo encontró un error inesperado.",
      appErrorFallback:
        "Intenta de nuevo. Si sigue ocurriendo, vuelve a la cola y abre el registro otra vez.",
      authErrorKicker: "Error de acceso",
      authErrorTitle: "No se pudo completar la autenticación.",
      authErrorFallback:
        "Intenta de nuevo o vuelve al inicio de sesión para reiniciar el flujo.",
      notFoundKicker: "No encontrado",
      notFoundTitle: "Ese registro no está disponible en el espacio actual.",
      notFoundCopy:
        "Puede ser un número inválido, un enlace viejo o un ticket no visible para tu rol actual.",
      tryAgain: "Intentar de nuevo",
      backToTickets: "Volver a tickets",
      backToSignIn: "Volver a entrar",
      openQueue: "Abrir cola"
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
      openFile: "Open file",
      active: "Active",
      inactive: "Inactive",
      never: "Never",
      allStatuses: "All statuses",
      clearFilters: "Clear filters"
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
      },
      forgotPassword: {
        heroKicker: "Recovery",
        heroTitle: "Request a reset token without leaving the internal flow.",
        heroCopy:
          "For now this MVP returns a temporary token directly while email delivery is still pending.",
        highlights: ["Temporary token", "No public signup", "Internal access"],
        cardEyebrow: "Password recovery",
        cardTitle: "Request a reset token",
        cardCopy:
          "Enter your company email. If the account exists, the app will start recovery and show the temporary token in this local version.",
        emailLabel: "Email",
        emailPlaceholder: "name@company.com",
        submit: "Request reset",
        submitting: "Generating token...",
        footerNote: "Remembered it?",
        footerLink: "Back to sign in",
        statusLabel: "Recovery status",
        defaultMessage:
          "If the account exists, a password reset token was generated.",
        tokenLabel: "Reset token",
        expiresLabel: "Expires {date}",
        continueLabel: "Continue to reset password",
        localOnlyNote:
          "Once email delivery is wired, the token will stop appearing in the response and arrive out of band.",
        genericError: "Unable to start password recovery.",
        serverError: "Unable to reach the server right now."
      },
      resetPassword: {
        heroKicker: "Recovery",
        heroTitle: "Set a new password and get back into the portal.",
        heroCopy:
          "Paste the recovery token, choose a new password, and return to the normal ticket workflow.",
        highlights: ["Minimum 8 characters", "Token validation", "Fast return"],
        cardEyebrow: "Reset password",
        cardTitle: "Finish the recovery flow",
        cardCopy:
          "This screen uses the same backend endpoint that the future email flow will keep using.",
        footerNote: "Need a token first?",
        footerLink: "Request one here",
        tokenLabel: "Reset token",
        tokenPlaceholder: "Paste the token from the previous step",
        passwordLabel: "New password",
        passwordPlaceholder: "At least 8 characters",
        confirmLabel: "Confirm password",
        confirmPlaceholder: "Repeat the new password",
        hintEmpty: "Use at least 8 characters.",
        hintShort: "The new password must be at least 8 characters.",
        hintReady: "The new password is ready to submit.",
        mismatch: "Passwords must match.",
        successLabel: "Password updated",
        successDefault: "Password updated successfully.",
        successAction: "Return to sign in",
        submit: "Reset password",
        submitting: "Updating password...",
        genericError: "Unable to reset the password.",
        serverError: "Unable to reach the server right now."
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
    },
    dashboard: {
      kickerStaff: "Operations dashboard",
      kickerRequester: "My dashboard",
      titleStaff:
        "Review queue pressure, response pace, and what needs attention first.",
      titleRequester:
        "Track your requests without losing the full support history.",
      copyStaff:
        "A simpler snapshot of the live flow so the team can spot load, urgency, and repeated categories without opening every case.",
      copyRequester:
        "See which requests are active, which are waiting on you, and where recent movement landed.",
      createTicket: "Create ticket",
      openQueue: "Open queue",
      reviewTickets: "Review my tickets",
      metricsStaff: {
        activeWork: "Active work",
        waitingOnUser: "Waiting on user",
        resolvedThisWeek: "Resolved this week",
        urgentTickets: "Urgent tickets"
      },
      metricsRequester: {
        openMine: "My open tickets",
        inProgress: "In progress",
        waitingOnMe: "Waiting on me",
        resolvedThisWeek: "Resolved this week"
      },
      workflowLabel: "Workflow",
      workflowTitle: "Status breakdown",
      ticketsInView: "{count} tickets in view",
      signalLabel: "Signals",
      signalTitle: "Operational highlights",
      averageFirstResponse: "Average first response",
      ticketsWithEvidence: "Tickets with evidence",
      topCategory: "Top category",
      noDataYet: "No data yet",
      trendsEmpty: "Category trends will appear once more tickets exist.",
      recentLabel: "Recent activity",
      recentTitleStaff: "Latest queue movement",
      recentTitleRequester: "Latest changes to my tickets",
      recentEmpty:
        "No ticket activity yet. Create the first ticket to start the record.",
      coverageLabel: "Coverage",
      coverageTitle: "User directory",
      activeUsers: "Active users",
      staffSeats: "Staff seats",
      admins: "Admins",
      catalogLabel: "Catalog",
      catalogTitle: "Category coverage",
      activeCategories: "Active categories",
      inactiveCategories: "Inactive categories",
      liveLeaders: "Live leaders",
      notAvailable: "N/A"
    },
    admin: {
      tickets: {
        roleTechnician: "Technician queue",
        roleAdmin: "Admin queue",
        title: "Keep the queue moving without losing the paper trail.",
        noteTechnician:
          "{count} tickets are waiting on the team. Start with what is blocked or urgent.",
        noteAdmin:
          "{count} tickets remain active across the organization. Sort by urgency, age, and blockers.",
        openRequester: "Open requester view",
        actionTechnician: "Start next ticket",
        actionAdmin: "Assign from queue",
        activeWork: "Active work",
        activeWorkHelp:
          "Tickets currently in progress or waiting for a reply in the visible queue.",
        urgent: "Urgent",
        inProgress: "In progress",
        resolved: "Resolved",
        closed: "Closed",
        snapshotLabel: "Queue snapshot",
        snapshotTitle:
          "Prioritize the cases that are aging, blocked, or escalating.",
        showingResults:
          "Showing {shown} of {total} tickets. {active} still count as active work.",
        searchLabel: "Search queue",
        searchPlaceholder: "Ticket, requester, department, or assignee",
        statusLabel: "Status",
        quickFilters: {
          all: "All",
          urgent: "Urgent",
          needs_response: "Needs response",
          with_attachments: "Has attachments"
        },
        emptyNone: "No tickets in the queue",
        emptyNoneTitle: "Everything is clear for now.",
        emptyNoneCopy:
          "When a request comes in, it will appear here with priority, status, and latest movement.",
        emptyFiltered: "No tickets match the current filters",
        emptyFilteredTitle: "Try widening the queue filters.",
        emptyFilteredCopy:
          "Search by requester, assignee, or ticket number to bring more results back.",
        requester: "Requester",
        department: "Department",
        assignee: "Assignee",
        response: "Response",
        openTicket: "Open ticket",
        awaitingFirstResponse: "Awaiting first response"
      },
      users: {
        heroKicker: "Admin",
        heroTitle: "Manage internal identities without breaking the audit trail.",
        heroCopy:
          "Users control access, assignment, and visibility. Keep roles and active status current.",
        directorySize: "Directory size",
        directorySizeHelp: "All internal accounts currently managed by the system.",
        activeUsers: "Active users",
        staffRoles: "Staff roles",
        createLabel: "Create account",
        createTitle: "Provision identities without leaving the panel",
        createHelp:
          "New users are created in the same directory the ticket workflow reads from.",
        fields: {
          fullName: "Full name",
          email: "Email",
          password: "Password",
          department: "Department",
          role: "Role"
        },
        placeholders: {
          fullName: "Ava Johnson",
          email: "ava@company.com",
          password: "Minimum 8 characters",
          department: "Finance, Support, or Operations"
        },
        accessNoteTitle: "Access note",
        accessNote:
          "Requesters create tickets. Technicians and admins can work and assign them.",
        createAction: "Create user",
        creatingAction: "Creating user...",
        directoryLabel: "Directory",
        directoryTitle:
          "Keep names, roles, and active flags aligned with the backend.",
        admins: "Admins",
        technicians: "Technicians",
        empty: "No users exist yet. Create the first account above.",
        department: "Department",
        lastLogin: "Last login",
        updated: "Updated",
        activeAccount: "Active account",
        cardHelp:
          "Passwords are managed through the create flow. Status and role changes update the same backend record used by ticket assignment.",
        saveAction: "Save changes",
        savingAction: "Saving...",
        requiredError:
          "Full name, email, and password are required.",
        updateNameError: "Full name cannot be empty.",
        createError: "Unable to create the user.",
        createServerError: "Unable to reach the server right now.",
        updateError: "Unable to update user.",
        updateServerError: "Unable to reach the server right now.",
        createSuccess: "Created {name}.",
        updateSuccess: "Saved changes for {name}."
      },
      categories: {
        heroKicker: "Admin",
        heroTitle: "Keep the category catalog clean and ready for intake.",
        heroCopy:
          "Categories affect routing, reporting, and intake quality. Keep the list simple and clear.",
        totalCategories: "Total categories",
        activeCategories: "Active categories",
        inactiveCategories: "Inactive categories",
        libraryLabel: "Library",
        libraryTitle: "Available categories",
        libraryCopy:
          "Edit the catalog here and let the ticket form inherit the changes.",
        createLabel: "Create category",
        createTitle: "New intake label",
        createCopy:
          "Use short, descriptive names that are easy for requesters to understand.",
        editLabel: "Edit category",
        editTitle: "Selected category",
        editCopy:
          "Update the current entry or retire it without deleting historical tickets.",
        fields: {
          name: "Name",
          description: "Description",
          editing: "Editing",
          status: "Status"
        },
        placeholders: {
          name: "Example: Software access",
          description: "Short helper text for the ticket form."
        },
        createAction: "Create category",
        creatingAction: "Creating...",
        saveAction: "Save changes",
        savingAction: "Saving...",
        optionalDescription:
          "Optional. Leave blank if the name is already clear enough.",
        requesterDescription:
          "Requesters will see this text wherever the category is offered.",
        keepAvailable: "Keep category available in ticket creation",
        emptyLibraryTitle: "No categories yet",
        emptyLibraryCopy:
          "Use the form to add the first request category.",
        emptySelectedTitle: "Select a category",
        emptySelectedCopy: "Click Edit on any category to load it here.",
        activeBadge: "Visible in intake",
        inactiveBadge: "Hidden from intake",
        noDescription: "No description provided.",
        editAction: "Edit",
        selectedAction: "Selected",
        createError: "Unable to create category.",
        createServerError: "Unable to reach the server right now.",
        updateError: "Unable to update category.",
        updateServerError: "Unable to reach the server right now.",
        createSuccess: "Created {name}.",
        updateSuccess: "Updated {name}.",
        createdAt: "Created {date}",
        updatedAt: "Updated {date}"
      }
    },
    routeState: {
      appErrorKicker: "Something broke",
      appErrorTitle: "The workspace hit an unexpected error.",
      appErrorFallback:
        "Try again. If it keeps happening, go back to the queue and reopen the record.",
      authErrorKicker: "Access error",
      authErrorTitle: "The authentication flow could not finish.",
      authErrorFallback:
        "Try again, or return to sign in and restart the flow.",
      notFoundKicker: "Not found",
      notFoundTitle: "That record is not available in the current workspace.",
      notFoundCopy:
        "It may be an invalid number, an outdated link, or a ticket not visible from your current role.",
      tryAgain: "Try again",
      backToTickets: "Back to tickets",
      backToSignIn: "Back to sign in",
      openQueue: "Open queue"
    }
  }
} as const;

export type AppDictionary = (typeof dictionaries)[Locale];

export function isSupportedLocale(value?: string | null): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getClientLocale(): Locale {
  if (typeof document === "undefined") {
    return "es";
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]+)`)
  );
  const cookieLocale = match ? decodeURIComponent(match[1]) : undefined;
  return isSupportedLocale(cookieLocale) ? cookieLocale : "es";
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

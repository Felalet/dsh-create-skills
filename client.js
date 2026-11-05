// Browser half of the Create Skills plugin: a Skills page in the sidebar with
// an installed-skills list, a catalog, and an editor for SKILL.md.
// Talks to the host half over the same-origin JSON API at
// /plugins/create-skills/api/*.
window.__ModuleLoader__.load({
  id: 'create-skills',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'create-skills';
    const API = '/plugins/create-skills/api';

    const RU = {
      title: 'Skills',
      subtitle: 'Скиллы проекта: источник, вес в промпте и доступность модели.',
      tabInstalled: 'Установленные',
      tabCatalog: 'Каталог',
      newSkill: 'Новый скилл',
      refresh: 'Обновить',
      load: 'Загрузить',
      pathPlaceholder: 'Путь к проекту',
      loading: 'Загрузка…',
      saving: 'Сохраняем…',
      error: 'Ошибка',
      retry: 'Повторить',
      empty: 'В этом проекте пока нет скиллов',
      emptyHint: 'Создайте .dsh/skills/<имя>/SKILL.md — скилл появится здесь без перезапуска.',
      modelOff: 'скрыт от модели',
      modelOn: 'для модели',
      tokens: 'токенов/запрос',
      skills: 'скиллов',
      incomplete: 'Каталог неполный: часть провайдеров не ответила.',
      estimate: 'Вес — оценка по длине имени и описания.',
      readOnly: 'только чтение',
      edit: 'Править',
      save: 'Сохранить',
      cancel: 'Отмена',
      create: 'Создать',
      delete: 'Удалить',
      enable: 'Включить',
      disable: 'Выключить',
      confirmDelete: 'Удалить скилл',
      scope: 'Куда сохранить',
      scopeProject: 'в проект',
      scopeUser: 'в пользовательские',
      name: 'Имя (kebab-case)',
      description: 'Описание (одна строка, до 200 символов)',
      whenToUse: 'Когда применять (необязательно)',
      content: 'Инструкции (Markdown)',
      created: 'Скилл создан',
      saved: 'Сохранено',
      deleted: 'Удалено',
      installedNotice: 'Установлено',
      install: 'Установить',
      installing: 'Устанавливаем…',
      installedBadge: 'уже установлен',
      installAll: 'Установить всё',
      catalogEmpty: 'В каталоге нет скиллов',
      catalogLoading: 'Загружаем каталог…',
      allInstalled: 'Все скиллы категории уже установлены',
      installScope: 'Установить',
      source_project_dsh: 'проект',
      source_project_agents: 'проект (.agents)',
      source_user_dsh: 'пользователь',
      source_user_agents: 'пользователь (.agents)',
      source_custom: 'дополнительный',
      source_bundled: 'встроенный',
      source_runtime: 'runtime',
    };

    const EN = {
      title: 'Skills',
      subtitle: 'Project skills: source, prompt weight, and model availability.',
      tabInstalled: 'Installed',
      tabCatalog: 'Catalog',
      newSkill: 'New skill',
      refresh: 'Refresh',
      load: 'Load',
      pathPlaceholder: 'Project path',
      loading: 'Loading…',
      saving: 'Saving…',
      error: 'Error',
      retry: 'Retry',
      empty: 'No skills in this project yet',
      emptyHint: 'Create .dsh/skills/<name>/SKILL.md — it appears here without a restart.',
      modelOff: 'hidden from model',
      modelOn: 'model-visible',
      tokens: 'tokens/request',
      skills: 'skills',
      incomplete: 'Catalog is incomplete: some providers did not answer.',
      estimate: 'Weight is estimated from the name and description length.',
      readOnly: 'read-only',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      create: 'Create',
      delete: 'Delete',
      enable: 'Enable',
      disable: 'Disable',
      confirmDelete: 'Delete skill',
      scope: 'Save to',
      scopeProject: 'project',
      scopeUser: 'user',
      name: 'Name (kebab-case)',
      description: 'Description (one line, up to 200 chars)',
      whenToUse: 'When to use (optional)',
      content: 'Instructions (Markdown)',
      created: 'Skill created',
      saved: 'Saved',
      deleted: 'Deleted',
      installedNotice: 'Installed',
      install: 'Install',
      installing: 'Installing…',
      installedBadge: 'installed',
      installAll: 'Install all',
      catalogEmpty: 'The catalog is empty',
      catalogLoading: 'Loading catalog…',
      allInstalled: 'Every skill in this category is already installed',
      installScope: 'Install to',
      source_project_dsh: 'project',
      source_project_agents: 'project (.agents)',
      source_user_dsh: 'user',
      source_user_agents: 'user (.agents)',
      source_custom: 'custom',
      source_bundled: 'bundled',
      source_runtime: 'runtime',
    };

    const styles = {
      page: {
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        padding: '28px 32px 48px',
        color: 'var(--dsw-alias-label-primary)',
      },
      inner: { maxWidth: 980, margin: '0 auto' },
      header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
      title: { margin: 0, fontSize: 22, fontWeight: 600, lineHeight: 1.2 },
      subtitle: { margin: '6px 0 0', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' },
      toolbar: { display: 'flex', gap: 8, marginTop: 20, alignItems: 'center', flexWrap: 'wrap' },
      input: {
        flex: '1 1 auto',
        minWidth: 220,
        padding: '7px 10px',
        fontSize: 13,
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        outline: 'none',
      },
      textarea: {
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 150,
        padding: '9px 10px',
        fontSize: 13,
        lineHeight: 1.5,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-base)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        outline: 'none',
        resize: 'vertical',
      },
      select: {
        padding: '7px 10px',
        fontSize: 13,
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        outline: 'none',
      },
      button: {
        padding: '7px 12px',
        fontSize: 13,
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        cursor: 'pointer',
      },
      small: { padding: '4px 9px', fontSize: 12 },
      primary: { borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-brand-primary)' },
      danger: { color: 'var(--dsw-alias-state-error-primary)', borderColor: 'var(--dsw-alias-state-error-primary)' },
      tabs: { display: 'flex', gap: 4, marginTop: 22, borderBottom: '1px solid var(--dsw-alias-border-l1)' },
      tab: {
        padding: '8px 12px',
        fontSize: 13,
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        color: 'var(--dsw-alias-label-secondary)',
        cursor: 'pointer',
      },
      tabActive: { color: 'var(--dsw-alias-label-primary)', borderBottomColor: 'var(--dsw-alias-brand-primary)' },
      summary: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 },
      chip: {
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-secondary)',
      },
      list: { marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 },
      row: {
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '13px 16px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        borderRadius: 10,
      },
      rowMain: { minWidth: 0, flex: '1 1 auto' },
      name: { fontSize: 14, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
      description: { marginTop: 4, fontSize: 13, lineHeight: 1.45, color: 'var(--dsw-alias-label-secondary)' },
      rowSide: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' },
      actions: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' },
      badge: {
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        color: 'var(--dsw-alias-label-secondary)',
        whiteSpace: 'nowrap',
      },
      warn: { color: 'var(--dsw-alias-state-warn-primary)', borderColor: 'var(--dsw-alias-state-warn-primary)' },
      ok: { color: 'var(--dsw-alias-state-success-primary)', borderColor: 'var(--dsw-alias-state-success-primary)' },
      mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
      note: { marginTop: 18, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      error: {
        marginTop: 18,
        padding: '12px 14px',
        border: '1px solid var(--dsw-alias-state-error-primary)',
        borderRadius: 10,
        color: 'var(--dsw-alias-state-error-primary)',
        fontSize: 13,
      },
      notice: {
        marginTop: 14,
        padding: '9px 12px',
        border: '1px solid var(--dsw-alias-state-success-primary)',
        borderRadius: 8,
        color: 'var(--dsw-alias-state-success-primary)',
        fontSize: 13,
      },
      noticeError: {
        marginTop: 14,
        padding: '9px 12px',
        border: '1px solid var(--dsw-alias-state-error-primary)',
        borderRadius: 8,
        color: 'var(--dsw-alias-state-error-primary)',
        fontSize: 13,
      },
      form: {
        marginTop: 18,
        padding: '16px',
        border: '1px solid var(--dsw-alias-border-l2)',
        background: 'var(--dsw-alias-bg-layer-1)',
        borderRadius: 12,
      },
      field: { display: 'block', marginTop: 12 },
      fieldLabel: { display: 'block', marginBottom: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      formRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
      formActions: { display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' },
      sectionTitle: { marginTop: 26, marginBottom: 8, fontSize: 13, fontWeight: 600 },
      empty: { marginTop: 36, padding: '28px 20px', textAlign: 'center', border: '1px dashed var(--dsw-alias-border-l1)', borderRadius: 12 },
      emptyTitle: { fontSize: 14, fontWeight: 600 },
      emptyHint: { marginTop: 6, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
    };

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function api(path, options) {
      const response = await fetch(API + path, options);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      return body;
    }

    function PanelIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M11 3.6l1.7 4.6 4.6 1.7-4.6 1.7L11 16.2 9.3 11.6 4.7 9.9l4.6-1.7L11 3.6z',
          fill: 'currentColor',
        }),
        h('path', {
          d: 'M18.2 14.4l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1 1-2.8z',
          fill: 'currentColor',
          opacity: 0.6,
        }),
      );
    }

    function sourceLabel(t, source) {
      const key = `source_${String(source).replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`;
      const label = t(key);
      return typeof label === 'string' && label !== key ? label : String(source);
    }

    class Boundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }
      static getDerivedStateFromError(error) {
        return { error };
      }
      componentDidCatch(error) {
        const message = error instanceof Error ? error.message : String(error);
        fetch(`${API}/client-event`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ event: 'error', message }),
        }).catch(() => {});
      }
      render() {
        if (this.state.error) {
          const message = this.state.error instanceof Error ? this.state.error.message : String(this.state.error);
          return h('div', { style: styles.error, role: 'alert' }, `Create Skills: ${message}`);
        }
        return this.props.children;
      }
    }

    function makePage(t) {
      return function SkillsPage() {
        const [tab, setTab] = React.useState('installed');
        const [skillsState, setSkillsState] = React.useState({ status: 'loading' });
        const [catalogState, setCatalogState] = React.useState({ status: 'idle' });
        const [pathDraft, setPathDraft] = React.useState('');
        const [editor, setEditor] = React.useState(null);
        const [busy, setBusy] = React.useState(null);
        const [notice, setNotice] = React.useState(null);
        const [installScope, setInstallScope] = React.useState('project');

        const loadSkills = React.useCallback(async (cwd) => {
          setSkillsState({ status: 'loading' });
          try {
            const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : '';
            const body = await api(`/skills${query}`);
            setSkillsState({ status: 'ready', data: body });
            setPathDraft((current) => current || body.projectRoot || '');
          } catch (error) {
            setSkillsState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
          }
        }, []);

        const loadCatalog = React.useCallback(async (cwd) => {
          setCatalogState({ status: 'loading' });
          try {
            const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : '';
            const body = await api(`/catalog${query}`);
            setCatalogState({ status: 'ready', data: body });
          } catch (error) {
            setCatalogState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
          }
        }, []);

        React.useEffect(() => {
          loadSkills();
        }, [loadSkills]);

        React.useEffect(() => {
          fetch(`${API}/client-event`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ event: 'mounted' }),
          }).catch(() => {});
        }, []);

        React.useEffect(() => {
          if (tab === 'catalog' && catalogState.status === 'idle') loadCatalog(pathDraft.trim() || undefined);
        }, [tab, catalogState.status, loadCatalog, pathDraft]);

        React.useEffect(() => {
          if (!notice) return undefined;
          const timer = setTimeout(() => setNotice(null), 4000);
          return () => clearTimeout(timer);
        }, [notice]);

        const refresh = async () => {
          const cwd = pathDraft.trim() || undefined;
          await sleep(250);
          await loadSkills(cwd);
          if (tab === 'catalog') await loadCatalog(cwd);
        };

        const openCreate = () => {
          setTab('installed');
          setEditor({
            mode: 'create',
            scope: 'project',
            name: '',
            description: '',
            whenToUse: '',
            content: '# Новый скилл\n\n',
            error: null,
            busy: false,
          });
        };

        const openEdit = async (skill) => {
          setBusy(skill.name);
          try {
            const body = await api(`/skills?name=${encodeURIComponent(skill.name)}`);
            setEditor({
              mode: 'edit',
              scope: skill.source === 'user-dsh' ? 'user' : 'project',
              name: skill.name,
              description: body.description || '',
              whenToUse: body.whenToUse || '',
              content: body.content || '',
              error: null,
              busy: false,
            });
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const submitEditor = async () => {
          if (!editor) return;
          const payload = {
            name: editor.name.trim(),
            description: editor.description.trim(),
            whenToUse: editor.whenToUse.trim(),
            content: editor.content,
          };
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.name)) {
            setEditor((current) => ({ ...current, error: t('name') }));
            return;
          }
          if (payload.description === '') {
            setEditor((current) => ({ ...current, error: t('description') }));
            return;
          }
          setEditor((current) => ({ ...current, busy: true, error: null }));
          try {
            if (editor.mode === 'create') {
              await api('/skills', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ ...payload, scope: editor.scope }),
              });
              setNotice({ kind: 'ok', text: t('created') });
            } else {
              await api('/skills', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
              });
              setNotice({ kind: 'ok', text: t('saved') });
            }
            setEditor(null);
            await refresh();
          } catch (error) {
            setEditor((current) => ({
              ...current,
              busy: false,
              error: error instanceof Error ? error.message : String(error),
            }));
          }
        };

        const toggleSkill = async (skill) => {
          setBusy(skill.name);
          try {
            await api('/skills', {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ name: skill.name, enabled: !skill.modelInvocable }),
            });
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const removeSkill = async (skill) => {
          if (!window.confirm(`${t('confirmDelete')} ${skill.name}?`)) return;
          setBusy(skill.name);
          try {
            await api(`/skills?name=${encodeURIComponent(skill.name)}`, { method: 'DELETE' });
            setNotice({ kind: 'ok', text: t('deleted') });
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const install = async (ids) => {
          if (ids.length === 0) {
            setNotice({ kind: 'error', text: t('allInstalled') });
            return;
          }
          setBusy(ids.join(','));
          try {
            const result = await api('/install', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ ids, scope: installScope }),
            });
            const failed = result.report.filter((item) => item.status === 'error');
            setNotice({
              kind: failed.length === 0 ? 'ok' : 'error',
              text:
                failed.length === 0
                  ? `${t('installedNotice')}: ${result.installed}`
                  : `${t('error')}: ${failed.map((item) => item.id + ' — ' + item.message).join('; ')}`,
            });
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const data = skillsState.status === 'ready' ? skillsState.data : null;
        const catalog = catalogState.status === 'ready' ? catalogState.data : null;

        const renderEditor = () =>
          h(
            'div',
            { style: styles.form },
            h(
              'div',
              { style: styles.formRow },
              editor.mode === 'create'
                ? h(
                    'label',
                    { style: Object.assign({}, styles.field, { flex: '0 0 160px' }) },
                    h('span', { style: styles.fieldLabel }, t('scope')),
                    h(
                      'select',
                      {
                        style: Object.assign({}, styles.select, { width: '100%' }),
                        value: editor.scope,
                        onChange: (event) => setEditor({ ...editor, scope: event.target.value }),
                      },
                      h('option', { value: 'project' }, t('scopeProject')),
                      h('option', { value: 'user' }, t('scopeUser')),
                    ),
                  )
                : null,
              editor.mode === 'create'
                ? h(
                    'label',
                    { style: Object.assign({}, styles.field, { flex: '1 1 240px' }) },
                    h('span', { style: styles.fieldLabel }, t('name')),
                    h('input', {
                      style: Object.assign({}, styles.input, { width: '100%' }),
                      value: editor.name,
                      placeholder: 'my-skill',
                      spellCheck: false,
                      onChange: (event) => setEditor({ ...editor, name: event.target.value }),
                    }),
                  )
                : null,
            ),
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('description')),
              h('input', {
                style: Object.assign({}, styles.input, { width: '100%' }),
                value: editor.description,
                maxLength: 200,
                onChange: (event) => setEditor({ ...editor, description: event.target.value }),
              }),
            ),
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('whenToUse')),
              h('input', {
                style: Object.assign({}, styles.input, { width: '100%' }),
                value: editor.whenToUse,
                maxLength: 120,
                onChange: (event) => setEditor({ ...editor, whenToUse: event.target.value }),
              }),
            ),
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('content')),
              h('textarea', {
                style: styles.textarea,
                value: editor.content,
                onChange: (event) => setEditor({ ...editor, content: event.target.value }),
              }),
            ),
            editor.error ? h('div', { style: styles.error }, editor.error) : null,
            h(
              'div',
              { style: styles.formActions },
              h(
                'button',
                { style: Object.assign({}, styles.button, styles.small), onClick: () => setEditor(null) },
                t('cancel'),
              ),
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.small, styles.primary),
                  disabled: editor.busy,
                  onClick: submitEditor,
                },
                editor.busy ? t('saving') : editor.mode === 'create' ? t('create') : t('save'),
              ),
            ),
          );

        const renderInstalled = () => {
          if (skillsState.status === 'loading') return h('div', { style: styles.note }, t('loading'));
          if (skillsState.status === 'error') {
            return h(
              'div',
              { style: styles.error },
              h('div', null, `${t('error')}: ${skillsState.message}`),
              h(
                'button',
                { style: Object.assign({}, styles.button, { marginTop: 10 }), onClick: () => loadSkills(pathDraft.trim() || undefined) },
                t('retry'),
              ),
            );
          }
          if (!data || data.skills.length === 0) {
            return h(
              'div',
              { style: styles.empty },
              h('div', { style: styles.emptyTitle }, t('empty')),
              h('div', { style: styles.emptyHint }, t('emptyHint')),
            );
          }
          return h(
            'div',
            null,
            h(
              'div',
              { style: styles.summary },
              h('span', { style: styles.chip }, `${data.skills.length} ${t('skills')}`),
              h('span', { style: styles.chip }, `~${data.totalWeight + (data.catalogOverhead || 0)} ${t('tokens')}`),
              data.complete === false ? h('span', { style: Object.assign({}, styles.chip, styles.warn) }, t('incomplete')) : null,
            ),
            h(
              'div',
              { style: styles.list },
              data.skills.map((skill) =>
                h(
                  'div',
                  { key: skill.name, style: styles.row },
                  h(
                    'div',
                    { style: styles.rowMain },
                    h('div', { style: styles.name }, skill.name),
                    h('div', { style: styles.description }, skill.description),
                    skill.writable
                      ? h(
                          'div',
                          { style: styles.actions },
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small),
                              disabled: busy === skill.name,
                              onClick: () => openEdit(skill),
                            },
                            t('edit'),
                          ),
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small),
                              disabled: busy === skill.name,
                              onClick: () => toggleSkill(skill),
                            },
                            skill.modelInvocable ? t('disable') : t('enable'),
                          ),
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small, styles.danger),
                              disabled: busy === skill.name,
                              onClick: () => removeSkill(skill),
                            },
                            t('delete'),
                          ),
                        )
                      : null,
                  ),
                  h(
                    'div',
                    { style: styles.rowSide },
                    h('span', { style: styles.badge }, sourceLabel(t, skill.source)),
                    skill.modelInvocable
                      ? h('span', { style: styles.badge }, t('modelOn'))
                      : h('span', { style: Object.assign({}, styles.badge, styles.warn) }, t('modelOff')),
                    skill.writable ? null : h('span', { style: styles.badge }, t('readOnly')),
                    h('span', { style: Object.assign({}, styles.badge, styles.mono) }, `~${skill.weight} tok`),
                  ),
                ),
              ),
            ),
            h('div', { style: styles.note }, t('estimate')),
          );
        };

        const renderCatalog = () => {
          if (catalogState.status === 'loading' || catalogState.status === 'idle') {
            return h('div', { style: styles.note }, t('catalogLoading'));
          }
          if (catalogState.status === 'error') {
            return h(
              'div',
              { style: styles.error },
              h('div', null, `${t('error')}: ${catalogState.message}`),
              h(
                'button',
                { style: Object.assign({}, styles.button, { marginTop: 10 }), onClick: () => loadCatalog(pathDraft.trim() || undefined) },
                t('retry'),
              ),
            );
          }
          if (!catalog || catalog.skills.length === 0) return h('div', { style: styles.note }, t('catalogEmpty'));

          return h(
            'div',
            null,
            h(
              'div',
              { style: styles.toolbar },
              h('span', { style: styles.note }, t('installScope')),
              h(
                'select',
                {
                  style: styles.select,
                  value: installScope,
                  onChange: (event) => setInstallScope(event.target.value),
                },
                h('option', { value: 'project' }, t('scopeProject')),
                h('option', { value: 'user' }, t('scopeUser')),
              ),
            ),
            catalog.categories.map((category) => {
              const entries = catalog.skills.filter((entry) => entry.category === category.id);
              const missing = entries.filter((entry) => !entry.installed);
              return h(
                'div',
                { key: category.id },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },
                  h('div', { style: styles.sectionTitle }, `${category.title} · ${entries.length}`),
                  missing.length > 0
                    ? h(
                        'button',
                        {
                          style: Object.assign({}, styles.button, styles.small),
                          disabled: busy === missing.map((entry) => entry.id).join(','),
                          onClick: () => install(missing.map((entry) => entry.id)),
                        },
                        t('installAll'),
                      )
                    : null,
                ),
                h(
                  'div',
                  { style: styles.list },
                  entries.map((entry) =>
                    h(
                      'div',
                      { key: entry.id, style: styles.row },
                      h(
                        'div',
                        { style: styles.rowMain },
                        h('div', { style: styles.name }, entry.title),
                        h('div', { style: styles.description }, entry.description),
                        h('div', { style: Object.assign({}, styles.note, styles.mono) }, entry.name),
                      ),
                      h(
                        'div',
                        { style: styles.rowSide },
                        entry.license ? h('span', { style: styles.badge }, entry.license) : null,
                        entry.installed
                          ? h('span', { style: Object.assign({}, styles.badge, styles.ok) }, t('installedBadge'))
                          : h(
                              'button',
                              {
                                style: Object.assign({}, styles.button, styles.small, styles.primary),
                                disabled: busy === entry.id,
                                onClick: () => install([entry.id]),
                              },
                              busy === entry.id ? t('installing') : t('install'),
                            ),
                      ),
                    ),
                  ),
                ),
              );
            }),
          );
        };

        return h(
          'div',
          { style: styles.page },
          h(
            'div',
            { style: styles.inner },
            h(
              'div',
              { style: styles.header },
              h(
                'div',
                null,
                h('h1', { style: styles.title }, t('title')),
                h('p', { style: styles.subtitle }, t('subtitle')),
              ),
              h(
                'button',
                { style: Object.assign({}, styles.button, styles.primary), onClick: openCreate },
                `+ ${t('newSkill')}`,
              ),
            ),
            h(
              'div',
              { style: styles.toolbar },
              h('input', {
                style: styles.input,
                value: pathDraft,
                placeholder: t('pathPlaceholder'),
                spellCheck: false,
                onChange: (event) => setPathDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    loadSkills(pathDraft.trim() || undefined);
                    if (tab === 'catalog') loadCatalog(pathDraft.trim() || undefined);
                  }
                },
              }),
              h('button', { style: styles.button, onClick: () => loadSkills(pathDraft.trim() || undefined) }, t('load')),
              h('button', { style: Object.assign({}, styles.button, styles.primary), onClick: refresh }, t('refresh')),
            ),
            h(
              'div',
              { style: styles.tabs },
              h(
                'button',
                {
                  style: Object.assign({}, styles.tab, tab === 'installed' ? styles.tabActive : null),
                  onClick: () => setTab('installed'),
                },
                t('tabInstalled'),
              ),
              h(
                'button',
                {
                  style: Object.assign({}, styles.tab, tab === 'catalog' ? styles.tabActive : null),
                  onClick: () => setTab('catalog'),
                },
                t('tabCatalog'),
              ),
            ),
            notice
              ? h('div', { style: notice.kind === 'error' ? styles.noticeError : styles.notice }, notice.text)
              : null,
            tab === 'installed' ? (editor ? renderEditor() : null) : null,
            tab === 'installed' ? renderInstalled() : renderCatalog(),
          ),
        );
      };
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { ru: RU, en: EN }), 'create-skills: dictionaries');
        const t = ctx.locale.bind(NS);
        const Page = makePage(t);
        function GuardedPage() {
          return h(Boundary, null, h(Page));
        }

        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: 'create-skills', locale: NS }, GuardedPage),
        );
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: 'create-skills', order: 30, label: () => t('title'), locale: NS },
            PanelIcon,
          ),
        );
      },
    };
  },
});

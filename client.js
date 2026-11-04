// Browser half of the Create Skills plugin: a Skills page in the sidebar.
// Talks to the host half over the same-origin JSON API at
// /plugins/create-skills/api/*.
window.__ModuleLoader__.load({
  id: 'create-skills',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'create-skills';

    const RU = {
      title: 'Skills',
      subtitle: 'Скиллы проекта: источник, вес в промпте и доступность модели.',
      refresh: 'Обновить',
      load: 'Загрузить',
      pathPlaceholder: 'Путь к проекту',
      loading: 'Загрузка…',
      error: 'Не удалось загрузить скиллы',
      retry: 'Повторить',
      empty: 'В этом проекте пока нет скиллов',
      emptyHint: 'Создайте .dsh/skills/<имя>/SKILL.md — скилл появится здесь без перезапуска.',
      modelOff: 'скрыт от модели',
      modelOn: 'для модели',
      tokens: 'токенов/запрос',
      skills: 'скиллов',
      incomplete: 'Каталог неполный: часть провайдеров не ответила.',
      estimate: 'Вес — оценка по длине имени и описания.',
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
      refresh: 'Refresh',
      load: 'Load',
      pathPlaceholder: 'Project path',
      loading: 'Loading…',
      error: 'Could not load skills',
      retry: 'Retry',
      empty: 'No skills in this project yet',
      emptyHint: 'Create .dsh/skills/<name>/SKILL.md — it appears here without a restart.',
      modelOff: 'hidden from model',
      modelOn: 'model-visible',
      tokens: 'tokens/request',
      skills: 'skills',
      incomplete: 'Catalog is incomplete: some providers did not answer.',
      estimate: 'Weight is estimated from the name and description length.',
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
      header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
      title: { margin: 0, fontSize: 22, fontWeight: 600, lineHeight: 1.2 },
      subtitle: { margin: '6px 0 0', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' },
      toolbar: { display: 'flex', gap: 8, marginTop: 20, alignItems: 'center' },
      input: {
        flex: '1 1 auto',
        minWidth: 240,
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
      primary: { borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-brand-primary)' },
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
      rowMain: { minWidth: 0 },
      name: { fontSize: 14, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
      description: { marginTop: 4, fontSize: 13, lineHeight: 1.45, color: 'var(--dsw-alias-label-secondary)' },
      rowSide: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' },
      badge: {
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        color: 'var(--dsw-alias-label-secondary)',
        whiteSpace: 'nowrap',
      },
      warn: { color: 'var(--dsw-alias-state-warn-primary)', borderColor: 'var(--dsw-alias-state-warn-primary)' },
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
      empty: { marginTop: 36, padding: '28px 20px', textAlign: 'center', border: '1px dashed var(--dsw-alias-border-l1)', borderRadius: 12 },
      emptyTitle: { fontSize: 14, fontWeight: 600 },
      emptyHint: { marginTop: 6, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
    };

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
        const [state, setState] = React.useState({ status: 'loading' });
        const [pathDraft, setPathDraft] = React.useState('');

        const load = React.useCallback(async (cwd) => {
          setState({ status: 'loading' });
          try {
            const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : '';
            const response = await fetch(`/plugins/create-skills/api/skills${query}`, {
              headers: { accept: 'application/json' },
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
            setState({ status: 'ready', data: body });
            setPathDraft((current) => current || body.projectRoot || '');
          } catch (error) {
            setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
          }
        }, []);

        React.useEffect(() => {
          load();
        }, [load]);

        const data = state.status === 'ready' ? state.data : null;

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
                  if (event.key === 'Enter') load(pathDraft.trim() || undefined);
                },
              }),
              h('button', { style: styles.button, onClick: () => load(pathDraft.trim() || undefined) }, t('load')),
              h('button', { style: Object.assign({}, styles.button, styles.primary), onClick: () => load(pathDraft.trim() || undefined) }, t('refresh')),
            ),
            data
              ? h(
                  'div',
                  { style: styles.summary },
                  h('span', { style: styles.chip }, `${data.skills.length} ${t('skills')}`),
                  h('span', { style: styles.chip }, `~${data.totalWeight + (data.catalogOverhead || 0)} ${t('tokens')}`),
                  data.complete === false ? h('span', { style: Object.assign({}, styles.chip, styles.warn) }, t('incomplete')) : null,
                )
              : null,
            state.status === 'loading' ? h('div', { style: styles.note }, t('loading')) : null,
            state.status === 'error'
              ? h(
                  'div',
                  { style: styles.error },
                  h('div', null, `${t('error')}: ${state.message}`),
                  h('button', { style: Object.assign({}, styles.button, { marginTop: 10 }), onClick: () => load(pathDraft.trim() || undefined) }, t('retry')),
                )
              : null,
            data && data.skills.length === 0
              ? h(
                  'div',
                  { style: styles.empty },
                  h('div', { style: styles.emptyTitle }, t('empty')),
                  h('div', { style: styles.emptyHint }, t('emptyHint')),
                )
              : null,
            data && data.skills.length > 0
              ? h(
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
                      ),
                      h(
                        'div',
                        { style: styles.rowSide },
                        h('span', { style: styles.badge }, sourceLabel(t, skill.source)),
                        skill.modelInvocable
                          ? h('span', { style: styles.badge }, t('modelOn'))
                          : h('span', { style: Object.assign({}, styles.badge, styles.warn) }, t('modelOff')),
                        h('span', { style: Object.assign({}, styles.badge, styles.mono) }, `~${skill.weight} tok`),
                      ),
                    ),
                  ),
                )
              : null,
            data ? h('div', { style: styles.note }, t('estimate')) : null,
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

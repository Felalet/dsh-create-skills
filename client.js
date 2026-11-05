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
      budgetOver: 'Каталог большой',
      budgetHint: 'Выключите лишние скиллы: они останутся доступны по /имя, но исчезнут из промпта модели.',
      versions: 'Версии',
      saveVersion: 'Сохранить версию',
      versionLabel: 'Метка версии',
      noVersions: 'Версий пока нет',
      versionSaved: 'Версия сохранена',
      versionApplied: 'Версия применена',
      close: 'Закрыть',
      apply: 'Применить',
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
      category: 'Категория',
      noCategory: 'Без категории',
      searchPlaceholder: 'Поиск по имени',
      nothingFound: 'Ничего не найдено',
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
      tabCompare: 'Сравнение',
      compareTask: 'Задача для сравнения (необязательно)',
      compareTaskPlaceholder: 'Например: подготовить квартальный отчёт с таблицей',
      runCompare: 'Сравнить',
      comparing: 'Сравниваем…',
      improve: 'Улучшить скилл',
      improving: 'Улучшаем…',
      improvedSaved: 'Улучшенная версия сохранена',
      chooseLeft: 'Выбрать левый',
      chooseRight: 'Выбрать правый',
      comparePick: 'Выберите скиллы слева и справа',
      allCategories: 'Все категории',
      catBuiltin: 'Встроенные',
      catMine: 'Мои скиллы',
      verdictWinner: 'Лучше по оценке',
      chooseAndDisable: 'Выбрать этот скилл и выключить второй',
      otherReadOnly: 'Второй скилл встроенный — выключить его нельзя',
      diffTitle: 'Различия',
      sameText: 'Тексты совпадают',
      backupSaved: 'бэкап',
      currentVersion: 'текущая',
      chosen: 'Выбрано',
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
      budgetOver: 'Catalog is large',
      budgetHint: 'Disable rarely used skills: they stay available via /name but leave the model prompt.',
      versions: 'Versions',
      saveVersion: 'Save version',
      versionLabel: 'Version label',
      noVersions: 'No versions yet',
      versionSaved: 'Version saved',
      versionApplied: 'Version applied',
      close: 'Close',
      apply: 'Apply',
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
      category: 'Category',
      noCategory: 'No category',
      searchPlaceholder: 'Search by name',
      nothingFound: 'Nothing found',
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
      tabCompare: 'Compare',
      compareTask: 'Task to compare on (optional)',
      compareTaskPlaceholder: 'For example: prepare a quarterly report with a table',
      runCompare: 'Compare',
      comparing: 'Comparing…',
      improve: 'Improve skill',
      improving: 'Improving…',
      improvedSaved: 'Improved version saved',
      chooseLeft: 'Choose left',
      chooseRight: 'Choose right',
      comparePick: 'Pick a skill on both sides',
      allCategories: 'All categories',
      catBuiltin: 'Bundled',
      catMine: 'My skills',
      verdictWinner: 'AI verdict',
      chooseAndDisable: 'Choose this skill and disable the other',
      otherReadOnly: 'The other skill is bundled and cannot be disabled',
      diffTitle: 'Differences',
      sameText: 'Texts are identical',
      backupSaved: 'backup',
      currentVersion: 'current',
      chosen: 'Chosen',
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

    // Minimal line diff: LCS over both bodies, then keep changes with two
    // lines of context. Sized for SKILL.md files, not general-purpose diffs.
    function diffLines(leftText, rightText) {
      const a = leftText.split('\n');
      const b = rightText.split('\n');
      if (a.length > 800 || b.length > 800) {
        return [{ type: 'gap', text: '…текст слишком большой для построчного сравнения…' }];
      }
      const n = a.length;
      const m = b.length;
      const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i -= 1) {
        for (let j = m - 1; j >= 0; j -= 1) {
          dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
      const ops = [];
      let i = 0;
      let j = 0;
      while (i < n && j < m) {
        if (a[i] === b[j]) {
          ops.push({ type: 'same', text: a[i] });
          i += 1;
          j += 1;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
          ops.push({ type: 'remove', text: a[i] });
          i += 1;
        } else {
          ops.push({ type: 'add', text: b[j] });
          j += 1;
        }
      }
      while (i < n) {
        ops.push({ type: 'remove', text: a[i] });
        i += 1;
      }
      while (j < m) {
        ops.push({ type: 'add', text: b[j] });
        j += 1;
      }

      const keep = new Array(ops.length).fill(false);
      for (let k = 0; k < ops.length; k += 1) {
        if (ops[k].type === 'same') continue;
        for (let c = Math.max(0, k - 2); c <= Math.min(ops.length - 1, k + 2); c += 1) keep[c] = true;
      }
      const out = [];
      let skipped = false;
      for (let k = 0; k < ops.length; k += 1) {
        if (!keep[k]) {
          skipped = true;
          continue;
        }
        if (skipped) {
          out.push({ type: 'gap', text: '…' });
          skipped = false;
        }
        out.push(ops[k]);
      }
      return out.slice(0, 240);
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

    function categoryLabel(t, id, categories) {
      if (!id) return '';
      if (id === 'builtin') return t('catBuiltin');
      if (id === 'mine') return t('catMine');
      const found = (categories || []).find((category) => category.id === id);
      return found ? found.title : id;
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
        const [versions, setVersions] = React.useState(null);
        const [compare, setCompare] = React.useState({
          left: { category: '', skill: '', label: '' },
          right: { category: '', skill: '', label: '' },
          task: '',
          busy: false,
          error: null,
          result: null,
          versions: { left: [], right: [] },
        });
        const [upgrading, setUpgrading] = React.useState(false);
        const [installScope, setInstallScope] = React.useState('project');
        const [skillSearch, setSkillSearch] = React.useState('');
        const [skillCategory, setSkillCategory] = React.useState('');

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
            category: '',
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
              category: body.category || '',
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
            category: editor.category,
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

        const openVersions = async (skill) => {
          setVersions({ skill: skill.name, status: 'loading', list: [], label: '', error: null });
          try {
            const body = await api(`/versions?skill=${encodeURIComponent(skill.name)}`);
            setVersions((current) =>
              current && current.skill === skill.name ? Object.assign({}, current, { status: 'ready', list: body.versions }) : current,
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setVersions((current) => Object.assign({}, current, { status: 'error', error: message }));
          }
        };

        const saveVersionNow = async () => {
          if (!versions) return;
          const label = versions.label.trim();
          if (label === '') {
            setVersions(Object.assign({}, versions, { error: t('versionLabel') }));
            return;
          }
          try {
            await api('/versions', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ skill: versions.skill, label }),
            });
            setNotice({ kind: 'ok', text: t('versionSaved') });
            await openVersions({ name: versions.skill });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setVersions(Object.assign({}, versions, { error: message }));
          }
        };

        const applyVersionNow = async (label) => {
          if (!versions) return;
          if (!window.confirm(`${t('apply')} ${label}?`)) return;
          try {
            const result = await api('/versions/apply', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ skill: versions.skill, label }),
            });
            setNotice({
              kind: 'ok',
              text: result && result.backup ? `${t('versionApplied')} (${t('backupSaved')}: ${result.backup})` : t('versionApplied'),
            });
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          }
        };

        const removeVersionNow = async (label) => {
          if (!versions) return;
          if (!window.confirm(`${t('delete')} ${label}?`)) return;
          try {
            await api(`/versions?skill=${encodeURIComponent(versions.skill)}&label=${encodeURIComponent(label)}`, { method: 'DELETE' });
            await openVersions({ name: versions.skill });
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
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

        const loadCompareVersions = async (side, skill) => {
          if (!skill) return;
          try {
            const body = await api(`/versions?skill=${encodeURIComponent(skill)}`);
            setCompare((current) =>
              Object.assign({}, current, {
                versions: Object.assign({}, current.versions, { [side]: body.versions }),
              }),
            );
          } catch {
            setCompare((current) =>
              Object.assign({}, current, { versions: Object.assign({}, current.versions, { [side]: [] }) }),
            );
          }
        };

        const setCompareSide = (side, patch) => {
          setCompare((current) => {
            const next = Object.assign({}, current, { [side]: Object.assign({}, current[side], patch) });
            if (patch.skill !== undefined) {
              next.versions = Object.assign({}, current.versions, { [side]: [] });
            }
            return next;
          });
          if (patch.skill !== undefined && patch.skill !== '') loadCompareVersions(side, patch.skill);
        };

        const runCompare = async (leftSpec, rightSpec) => {
          const left = leftSpec || compare.left;
          const right = rightSpec || compare.right;
          if (!left.skill || !right.skill) {
            setCompare((current) => Object.assign({}, current, { error: t('comparePick') }));
            return;
          }
          setCompare((current) => Object.assign({}, current, { busy: true, error: null, result: null }));
          try {
            const body = await api('/compare', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                left: { name: left.skill, label: left.label || undefined },
                right: { name: right.skill, label: right.label || undefined },
                task: compare.task,
              }),
            });
            setCompare((current) => Object.assign({}, current, { busy: false, result: body }));
          } catch (error) {
            setCompare((current) =>
              Object.assign({}, current, {
                busy: false,
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          }
        };

        const improveNow = async () => {
          if (!compare.left.skill) {
            setCompare((current) => Object.assign({}, current, { error: t('comparePick') }));
            return;
          }
          setUpgrading(true);
          setCompare((current) => Object.assign({}, current, { error: null, result: null }));
          try {
            const improved = await api('/improve', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                name: compare.left.skill,
                label: compare.left.label || undefined,
                task: compare.task,
              }),
            });
            setCompare((current) =>
              Object.assign({}, current, {
                right: { category: current.left.category, skill: improved.skill, label: improved.label },
              }),
            );
            await loadCompareVersions('right', improved.skill);
            setNotice({ kind: 'ok', text: `${t('improvedSaved')}: ${improved.label}` });
            await runCompare(compare.left, { skill: improved.skill, label: improved.label });
          } catch (error) {
            setCompare((current) =>
              Object.assign({}, current, {
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          } finally {
            setUpgrading(false);
          }
        };

        const chooseVariant = async (side) => {
          if (!compare.result) return;
          const pick = compare.result[side];
          if (compare.result.left.name === compare.result.right.name && pick.label) {
            try {
              await api('/versions/apply', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ skill: pick.name, label: pick.label }),
              });
              setNotice({ kind: 'ok', text: t('versionApplied') });
              await refresh();
            } catch (error) {
              setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
            }
            return;
          }
          const otherName = side === 'left' ? compare.result.right.name : compare.result.left.name;
          const pickSkill = data ? data.skills.find((skill) => skill.name === pick.name) : null;
          const otherSkill = data ? data.skills.find((skill) => skill.name === otherName) : null;
          if (!window.confirm(`${t('chooseAndDisable')} (${otherName})?`)) return;
          try {
            if (pickSkill && pickSkill.writable) {
              await api('/skills', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: pick.name, enabled: true }),
              });
            }
            if (otherSkill && otherSkill.writable) {
              await api('/skills', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: otherName, enabled: false }),
              });
              setNotice({ kind: 'ok', text: `${t('chosen')}: ${pick.name} · ${otherName} — off` });
            } else {
              setNotice({ kind: 'error', text: t('otherReadOnly') });
            }
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          }
        };

        const renderCompare = () => {
          const skills = data ? data.skills : [];
          const categories = data && data.categories ? data.categories : [];
          const sideCard = (side, title) => {
            const sideState = compare[side];
            const sideVersions = compare.versions[side] || [];
            const visibleSkills = skills.filter(
              (skill) => !sideState.category || skill.category === sideState.category,
            );
            return h(
              'div',
              { style: Object.assign({}, styles.form, { flex: '1 1 320px', marginTop: 0 }) },
              h('div', { style: styles.name }, title),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%', marginTop: 8 }),
                  value: sideState.category,
                  onChange: (event) =>
                    setCompareSide(side, { category: event.target.value, skill: '', label: '' }),
                },
                h('option', { value: '' }, t('allCategories')),
                categories.map((category) =>
                  h(
                    'option',
                    { key: category.id, value: category.id },
                    category.id === 'builtin'
                      ? t('catBuiltin')
                      : category.id === 'mine'
                        ? t('catMine')
                        : category.title,
                  ),
                ),
              ),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%', marginTop: 8 }),
                  value: sideState.skill,
                  onChange: (event) => setCompareSide(side, { skill: event.target.value, label: '' }),
                },
                h('option', { value: '' }, '—'),
                visibleSkills.map((skill) => h('option', { key: skill.name, value: skill.name }, skill.name)),
              ),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%', marginTop: 8 }),
                  value: sideState.label,
                  onChange: (event) => setCompareSide(side, { label: event.target.value }),
                },
                h('option', { value: '' }, t('currentVersion')),
                sideVersions.map((version) => h('option', { key: version.label, value: version.label }, version.label)),
              ),
            );
          };

          const result = compare.result;
          const column = (side) => {
            if (!result) return null;
            const item = result[side];
            const verdict = side === 'left' ? result.verdict.left : result.verdict.right;
            return h(
              'div',
              { style: Object.assign({}, styles.form, { flex: '1 1 320px', marginTop: 0, minWidth: 0 }) },
              h('div', { style: styles.name }, `${item.name}${item.label ? ' / ' + item.label : ''}`),
              h(
                'pre',
                {
                  style: Object.assign({}, styles.textarea, {
                    whiteSpace: 'pre-wrap',
                    maxHeight: 240,
                    minHeight: 0,
                    overflow: 'auto',
                  }),
                },
                item.body,
              ),
              h('div', { style: Object.assign({}, styles.description, { whiteSpace: 'pre-wrap' }) }, verdict),
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.small, styles.primary, { marginTop: 10 }),
                  onClick: () => chooseVariant(side),
                },
                side === 'left' ? t('chooseLeft') : t('chooseRight'),
              ),
            );
          };

          return h(
            'div',
            null,
            h(
              'div',
              { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 } },
              sideCard('left', 'A'),
              sideCard('right', 'B'),
            ),
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('compareTask')),
              h('textarea', {
                style: Object.assign({}, styles.textarea, { minHeight: 70, fontFamily: 'inherit' }),
                value: compare.task,
                placeholder: t('compareTaskPlaceholder'),
                onChange: (event) => setCompare((current) => Object.assign({}, current, { task: event.target.value })),
              }),
            ),
            compare.error ? h('div', { style: styles.error }, compare.error) : null,
            h(
              'div',
              { style: { marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' } },
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.primary),
                  disabled: compare.busy || upgrading,
                  onClick: () => runCompare(),
                },
                compare.busy ? t('comparing') : t('runCompare'),
              ),
              h(
                'button',
                {
                  style: styles.button,
                  disabled: compare.busy || upgrading,
                  onClick: improveNow,
                },
                upgrading ? t('improving') : t('improve'),
              ),
            ),
            result
              ? h(
                  'div',
                  null,
                  h(
                    'div',
                    { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 } },
                    column('left'),
                    column('right'),
                  ),
                  result.left.body === result.right.body
                    ? h('div', { style: styles.note }, t('sameText'))
                    : h(
                        'div',
                        null,
                        h('div', { style: styles.sectionTitle }, t('diffTitle')),
                        h(
                          'pre',
                          {
                            style: Object.assign({}, styles.textarea, {
                              maxHeight: 360,
                              overflow: 'auto',
                              minHeight: 0,
                              fontSize: 12,
                            }),
                          },
                          diffLines(result.left.body, result.right.body).map((line, index) =>
                            h(
                              'div',
                              {
                                key: index,
                                style: {
                                  color:
                                    line.type === 'remove'
                                      ? 'var(--dsw-alias-state-error-primary)'
                                      : line.type === 'add'
                                        ? 'var(--dsw-alias-state-success-primary)'
                                        : 'var(--dsw-alias-label-secondary)',
                                },
                              },
                              `${line.type === 'remove' ? '-' : line.type === 'add' ? '+' : ' '} ${line.text}`,
                            ),
                          ),
                        ),
                      ),
                  h(
                    'div',
                    { style: styles.note },
                    `${t('verdictWinner')}: ${result.verdict.winner === 'tie' ? '—' : result.verdict.winner === 'left' ? 'A' : 'B'}`,
                  ),
                )
              : null,
          );
        };

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
              h('span', { style: styles.fieldLabel }, t('category')),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%' }),
                  value: editor.category,
                  onChange: (event) => setEditor({ ...editor, category: event.target.value }),
                },
                h('option', { value: '' }, t('noCategory')),
                (data && data.categories ? data.categories : []).map((category) =>
                  h(
                    'option',
                    { key: category.id, value: category.id },
                    categoryLabel(t, category.id, data ? data.categories : []),
                  ),
                ),
              ),
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

        const renderVersions = () => {
          if (!versions) return null;
          const rows = versions.list.map((version) =>
            h(
              'div',
              {
                key: version.label,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 10px',
                  border: '1px solid var(--dsw-alias-border-l1)',
                  borderRadius: 8,
                },
              },
              h(
                'div',
                null,
                h('div', { style: styles.name }, version.label),
                h('div', { style: styles.note }, new Date(version.savedAt).toLocaleString()),
              ),
              h(
                'div',
                { style: { display: 'flex', gap: 6 } },
                h(
                  'button',
                  { style: Object.assign({}, styles.button, styles.small), onClick: () => applyVersionNow(version.label) },
                  t('apply'),
                ),
                h(
                  'button',
                  { style: Object.assign({}, styles.button, styles.small, styles.danger), onClick: () => removeVersionNow(version.label) },
                  t('delete'),
                ),
              ),
            ),
          );
          return h(
            'div',
            { style: styles.form },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
              h('div', { style: styles.name }, `${t('versions')}: ${versions.skill}`),
              h('button', { style: Object.assign({}, styles.button, styles.small), onClick: () => setVersions(null) }, t('close')),
            ),
            h(
              'div',
              { style: Object.assign({}, styles.formRow, { marginTop: 10 }) },
              h('input', {
                style: Object.assign({}, styles.input, { flex: '1 1 200px' }),
                value: versions.label,
                placeholder: t('versionLabel'),
                spellCheck: false,
                onChange: (event) => setVersions(Object.assign({}, versions, { label: event.target.value })),
              }),
              h('button', { style: Object.assign({}, styles.button, styles.small), onClick: saveVersionNow }, t('saveVersion')),
            ),
            versions.error ? h('div', { style: styles.error }, versions.error) : null,
            versions.status === 'loading' ? h('div', { style: styles.note }, t('loading')) : null,
            versions.status === 'ready' && rows.length === 0 ? h('div', { style: styles.note }, t('noVersions')) : null,
            h('div', { style: styles.list }, rows),
          );
        };

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
          const budget = data.totalWeight + (data.catalogOverhead || 0);
          const term = skillSearch.trim().toLowerCase();
          const visible = data.skills.filter((skill) => {
            const byCategory = !skillCategory || skill.category === skillCategory;
            const byName =
              term === '' ||
              skill.name.toLowerCase().includes(term) ||
              (skill.description || '').toLowerCase().includes(term);
            return byCategory && byName;
          });
          return h(
            'div',
            null,
            h(
              'div',
              { style: Object.assign({}, styles.toolbar, { marginTop: 12 }) },
              h('input', {
                style: Object.assign({}, styles.input, { flex: '1 1 180px' }),
                value: skillSearch,
                placeholder: t('searchPlaceholder'),
                spellCheck: false,
                onChange: (event) => setSkillSearch(event.target.value),
              }),
              h(
                'select',
                {
                  style: styles.select,
                  value: skillCategory,
                  onChange: (event) => setSkillCategory(event.target.value),
                },
                h('option', { value: '' }, t('allCategories')),
                (data.categories || []).map((category) =>
                  h(
                    'option',
                    { key: category.id, value: category.id },
                    categoryLabel(t, category.id, data.categories),
                  ),
                ),
              ),
            ),
            h(
              'div',
              { style: styles.summary },
              h('span', { style: styles.chip }, `${data.skills.length} ${t('skills')}`),
              h('span', { style: styles.chip }, `~${budget} ${t('tokens')}`),
              data.complete === false ? h('span', { style: Object.assign({}, styles.chip, styles.warn) }, t('incomplete')) : null,
            ),
            budget > 1200
              ? h(
                  'div',
                  { style: styles.noticeError },
                  `${t('budgetOver')}: ~${budget} ${t('tokens')}. ${t('budgetHint')}`,
                )
              : null,
            visible.length === 0 ? h('div', { style: styles.note }, t('nothingFound')) : null,
            h(
              'div',
              { style: styles.list },
              visible.map((skill) =>
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
                              onClick: () => openVersions(skill),
                            },
                            t('versions'),
                          ),
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
                    skill.category
                      ? h('span', { style: styles.badge }, categoryLabel(t, skill.category, data.categories))
                      : null,
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
                          onClick: () => {
                            const delta = missing.reduce(
                              (sum, entry) => sum + Math.ceil((entry.name.length + entry.description.length) / 4),
                              0,
                            );
                            if (!window.confirm(`${t('installAll')}: ${missing.length} · ~+${delta} ${t('tokens')}`)) return;
                            install(missing.map((entry) => entry.id));
                          },
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
              h(
                'button',
                {
                  style: Object.assign({}, styles.tab, tab === 'compare' ? styles.tabActive : null),
                  onClick: () => setTab('compare'),
                },
                t('tabCompare'),
              ),
            ),
            notice
              ? h('div', { style: notice.kind === 'error' ? styles.noticeError : styles.notice }, notice.text)
              : null,
            tab === 'installed' ? (editor ? renderEditor() : null) : null,
            tab === 'installed' ? (versions ? renderVersions() : null) : null,
            tab === 'installed' ? renderInstalled() : tab === 'catalog' ? renderCatalog() : renderCompare(),
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

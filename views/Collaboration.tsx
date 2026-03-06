import React, { useState, useEffect, useRef } from 'react';
import { AppState, Team, Channel, Message, Task, Project } from '../types';
import {
    Hash,
    Search,
    Plus,
    Send,
    Paperclip,
    Users,
    Settings,
    ChevronRight,
    FolderLock,
    Layout,
    CheckCircle2,
    Clock,
    MoreVertical,
    UserPlus,
    MessageSquare,
    Files,
    LayoutGrid,
    Briefcase
} from 'lucide-react';
import { generateId } from '../utils';

interface CollaborationProps {
    state: AppState;
    setState: (updater: (prev: AppState) => AppState) => void;
}

const Collaboration: React.FC<CollaborationProps> = ({ state, setState }) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'projects' | 'members' | 'files'>('chat');
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [messageInput, setMessageInput] = useState('');

    const activeTeam = state.teams.find(t => t.id === state.activeTeamId) || null;
    const activeChannel = activeTeam?.channels.find(c => c.id === state.activeChannelId) || null;

    const handleSendMessage = () => {
        if (!messageInput.trim() || !state.activeChannelId) return;

        const newMessage: Message = {
            id: generateId(),
            channelId: state.activeChannelId,
            senderId: 'current-user', // In a real app, this would be the actual user id
            senderName: state.settings.profile.name || 'Me',
            senderAvatar: state.settings.profile.avatarUrl,
            content: messageInput,
            timestamp: new Date().toISOString()
        };

        setState(prev => ({
            ...prev,
            messages: {
                ...prev.messages,
                [state.activeChannelId!]: [...(prev.messages[state.activeChannelId!] || []), newMessage]
            }
        }));
        setMessageInput('');
    };

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-screen bg-white dark:bg-slate-950 overflow-hidden">
            {/* 1. Teams Sidebar (The very left icons) */}
            <div className="w-[70px] bg-slate-900 flex flex-col items-center py-4 gap-4 overflow-y-auto no-scrollbar">
                {state.teams.map(team => (
                    <button
                        key={team.id}
                        onClick={() => setState(prev => ({ ...prev, activeTeamId: team.id }))}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all relative group
              ${state.activeTeamId === team.id ? 'bg-blue-600 rounded-xl' : 'bg-slate-800 hover:bg-blue-600/50 hover:rounded-xl'}
            `}
                    >
                        {team.icon ? <img src={team.icon} className="w-full h-full object-cover rounded-inherit" alt={team.name} /> : team.name.substring(0, 2).toUpperCase()}
                        {state.activeTeamId === team.id && <div className="absolute -left-1 w-2 h-8 bg-white rounded-r-full" />}

                        {/* Tooltip */}
                        <div className="absolute left-16 px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                            {team.name}
                        </div>
                    </button>
                ))}

                <button
                    onClick={() => setShowCreateTeam(true)}
                    className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/50 hover:bg-emerald-500 hover:text-white transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* 2. Workspace Sidebar (Channels, Projects, etc) */}
            <div className="w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white truncate uppercase tracking-wider text-xs">
                        {activeTeam?.name || 'Workspace'}
                    </h2>
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                        <Settings size={14} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6 custom-scrollbar">
                    {/* Channels Section */}
                    <div>
                        <div className="flex items-center justify-between mb-1 px-2">
                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Channels</span>
                            <button
                                onClick={() => setShowCreateChannel(true)}
                                className="p-1 hover:text-blue-500 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="space-y-px">
                            {activeTeam?.channels.map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => {
                                        setState(prev => ({ ...prev, activeChannelId: channel.id }));
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all
                    ${state.activeChannelId === channel.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}
                  `}
                                >
                                    <Hash size={16} className={state.activeChannelId === channel.id ? 'text-white/70' : 'text-slate-400'} />
                                    <span className="truncate">{channel.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div>
                        <div className="flex items-center justify-between mb-1 px-2">
                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Workspace</span>
                        </div>
                        <div className="space-y-px">
                            <NavItem icon={<Briefcase size={16} />} label="Projects" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
                            <NavItem icon={<Users size={16} />} label="Team Members" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
                            <NavItem icon={<Files size={16} />} label="Files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'chat' && activeChannel ? (
                    <TeamChat
                        channel={activeChannel}
                        messages={state.messages[activeChannel.id] || []}
                        messageInput={messageInput}
                        setMessageInput={setMessageInput}
                        onSendMessage={handleSendMessage}
                        state={state}
                    />
                ) : activeTab === 'projects' ? (
                    <TeamProjects
                        state={state}
                        setState={setState}
                        activeProjectId={activeProjectId}
                        setActiveProjectId={setActiveProjectId}
                    />
                ) : activeTab === 'members' ? (
                    <TeamMembers activeTeam={activeTeam} />
                ) : activeTab === 'files' ? (
                    <TeamFiles activeTeam={activeTeam} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-bold italic">
                        Select a channel or section to begin
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-components ---

const NavItem = ({ icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all
      ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}
    `}
    >
        <div className={active ? 'text-white/70' : 'text-slate-400'}>{icon}</div>
        <span className="truncate">{label}</span>
    </button>
);

const TeamChat = ({ channel, messages, messageInput, setMessageInput, onSendMessage, state }: any) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center rounded-xl">
                        <Hash size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white leading-tight">#{channel.name}</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{channel.description || 'Channel conversation'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <Search size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <Users size={20} />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/30 dark:bg-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-12">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-4">
                            <MessageSquare size={40} className="text-slate-400" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Welcome to #{channel.name}</h4>
                        <p className="text-sm font-bold text-slate-500">This is the beginning of the #{channel.name} channel. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg: Message) => (
                        <div key={msg.id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0 overflow-hidden border-2 border-transparent group-hover:border-blue-500/30 transition-all">
                                {msg.senderAvatar ? <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" /> : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                                        {msg.senderName.substring(0, 2)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-slate-900 dark:text-white text-sm">{msg.senderName}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-6 pt-0">
                <div className="relative group/input">
                    <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-[2rem] blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                    <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 group-focus-within/input:border-blue-500/30 rounded-[2rem] p-2 flex items-end gap-2 shadow-sm transition-all">
                        <button className="p-3 text-slate-400 hover:text-blue-500 transition-all">
                            <Plus size={22} />
                        </button>
                        <textarea
                            rows={1}
                            placeholder={`Message #${channel.name}`}
                            className="flex-1 bg-transparent border-none py-3 px-1 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 resize-none max-h-32"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSendMessage();
                                }
                            }}
                        />
                        <div className="flex items-center gap-1 pr-2 pb-1">
                            <button className="p-2 text-slate-400 hover:text-amber-500 transition-all">
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={onSendMessage}
                                disabled={!messageInput.trim()}
                                className={`p-3 rounded-2xl transition-all ${messageInput.trim()
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                    }`}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeamProjects = ({ state, setState, activeProjectId, setActiveProjectId }: any) => {
    const activeTeam = state.teams.find((t: any) => t.id === state.activeTeamId);
    const teamProjects = state.projects.filter((p: any) => p.teamId === state.activeTeamId);
    const selectedProject = state.projects.find((p: any) => p.id === activeProjectId);

    if (selectedProject) {
        return (
            <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-transparent">
                <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveProjectId(null)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                        >
                            <ChevronRight size={20} className="rotate-180" />
                        </button>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white leading-tight">{selectedProject.title}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks & Management</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">
                        <Plus size={18} /> Add Task
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto p-6 flex gap-6 no-scrollbar">
                    {['todo', 'in_progress', 'review', 'done'].map(status => {
                        const statusTasks = state.tasks.filter((t: any) => t.projectId === selectedProject.id && t.status === status);
                        return (
                            <div key={status} className="w-[300px] flex-shrink-0 flex flex-col gap-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${status === 'todo' ? 'bg-slate-400' : status === 'in_progress' ? 'bg-blue-500' : status === 'review' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            {status.replace('_', ' ')}
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">{statusTasks.length}</span>
                                </div>
                                <div className="flex-1 space-y-3">
                                    {statusTasks.map((task: any) => (
                                        <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                            <h5 className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors mb-2">{task.title}</h5>
                                            <p className="text-[11px] font-medium text-slate-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex -space-x-1.5">
                                                    <div className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-[8px] font-black uppercase text-slate-500">
                                                        {task.assignedTo?.substring(0, 1) || 'A'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock size={12} />
                                                    <span className="text-[9px] font-black">2d</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-300 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-400 transition-all">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-transparent">
            <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white">Team Projects</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{teamProjects.length} Active Projects</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 shadow-lg shadow-blue-500/20 text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all active:scale-95">
                    <Plus size={18} />
                    Create Project
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 xl:grid-cols-2 gap-6 no-scrollbar">
                {teamProjects.length === 0 ? (
                    <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                            <Briefcase size={40} className="text-slate-400" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">No projects yet</h4>
                        <p className="max-w-[300px] text-sm font-bold text-slate-500 leading-relaxed">
                            Create your first team project to start collaborating with your members.
                        </p>
                    </div>
                ) : (
                    teamProjects.map((project: Project) => (
                        <div
                            key={project.id}
                            onClick={() => setActiveProjectId(project.id)}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-500/5 transition-all group border-l-4 border-l-blue-500 cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">{project.title}</h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project.category || 'PROJECT'}</span>
                                </div>
                                <div className="flex -space-x-3">
                                    {project.assignedMembers?.map((mId, i) => (
                                        <div key={i} className="w-8 h-8 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-slate-500 overflow-hidden">
                                            <Users size={12} />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                                {project.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Clock size={16} />
                                        <span className="text-[11px] font-extrabold uppercase tracking-widest">{new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-500">
                                        <Layout size={16} />
                                        <span className="text-[11px] font-extrabold uppercase tracking-widest">
                                            {state.tasks.filter((t: any) => t.projectId === project.id).length} Tasks
                                        </span>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                                    Active
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const TeamMembers = ({ activeTeam }: any) => {
    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white">Team Members</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTeam?.members.length} Members</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">
                    <UserPlus size={18} /> Invite Member
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-4">
                {activeTeam?.members.map((member: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 relative">
                                {member.name.substring(0, 2).toUpperCase()}
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white">{member.name}</h4>
                                <p className="text-xs font-bold text-slate-400">{member.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                {member.role}
                            </span>
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TeamFiles = ({ activeTeam }: any) => {
    const dummyFiles = [
        { name: 'Brand_Guidelines.pdf', size: '4.2 MB', type: 'PDF', owner: 'You', date: '2 days ago' },
        { name: 'Redesign_Mockups.fig', size: '12.8 MB', type: 'Design', owner: 'You', date: '5 days ago' },
        { name: 'Client_Contract.docx', size: '1.1 MB', type: 'Doc', owner: 'Sarah', date: '1 week ago' }
    ];

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white">Shared Files</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managed Cloud Assets</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">
                    <Paperclip size={18} /> Upload File
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">File Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Size</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Owner</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {dummyFiles.map((file, i) => (
                                <tr key={i} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-500">
                                                <Files size={18} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">{file.size}</td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-500">{file.owner}</td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">{file.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Collaboration;

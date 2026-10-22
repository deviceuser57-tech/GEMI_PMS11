import React, { useEffect, useRef, useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { GitBranch, ShieldCheck, AlertTriangle, Layers, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';
import * as d3 from 'd3';

interface DependencyGraphViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  records,
  isArabic,
  onSelectRecord
}) => {
  const containerRef = useGsapPageReveal<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<BaseRecord | null>(null);
  const [filterEntity, setFilterEntity] = useState<string>('all');

  // Prepare nodes (WPS, Gates, Rules, Gaps, Tasks) and links
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 900;
    const height = 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Filter records for graph nodes
    const graphRecords = records.filter(r => {
      if (filterEntity === 'all') return ['wps', 'gate', 'rule', 'gap', 'task'].includes(r.entity);
      return r.entity === filterEntity;
    }).slice(0, 50);

    const nodes = graphRecords.map(r => ({
      id: r.id,
      rid: r.rid,
      title: r.title,
      entity: r.entity,
      status: r.status,
      record: r,
      x: width / 2 + (Math.random() - 0.5) * 300,
      y: height / 2 + (Math.random() - 0.5) * 300
    }));

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const links: { source: any; target: any }[] = [];

    // Create logical links between WPS and rules/tasks/gaps
    nodes.forEach(n => {
      if (n.record.wps_id) {
        const targetWps = nodes.find(item => item.rid === n.record.wps_id || item.record.wps_id === n.record.wps_id);
        if (targetWps && targetWps.id !== n.id) {
          links.push({ source: n.id, target: targetWps.id });
        }
      }
    });

    // Add some default dependency links if links are few
    if (links.length < 10 && nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({ source: nodes[i].id, target: nodes[i + 1].id });
      }
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(35));

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#334155')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call((d3.drag() as any)
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event: any, d: any) => {
        setSelectedNode(d.record);
      });

    node.append('circle')
      .attr('r', 24)
      .attr('fill', (d: any) => {
        if (d.entity === 'wps') return '#0d9488'; // teal
        if (d.entity === 'gate') return '#10b981'; // emerald
        if (d.entity === 'gap') return '#f43f5e'; // rose
        if (d.entity === 'rule') return '#3b82f6'; // blue
        return '#64748b'; // slate
      })
      .attr('stroke', '#f8fafc')
      .attr('stroke-width', 2)
      .attr('class', 'transition-transform cursor-pointer hover:scale-125');

    node.append('text')
      .text((d: any) => d.rid)
      .attr('x', 0)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

  }, [records, filterEntity]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-slate-950 to-cyan-950 border border-teal-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" />
                {isArabic ? 'خريطة الاعتماديات التفاعلية (D3 Dependency Graph)' : 'Interactive D3 Dependency & Blocking Graph'}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {isArabic ? 'رسم تعقيدات واختناقات دورة الإغلاق للـ 40 شيت' : 'Mapping Closure Loop Bottlenecks & Record Interdependencies'}
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              {isArabic
                ? 'استكشف بصرياً كيف ترتبط حزم العمل، القواعد، البوابات، والفجوات، وحدد العناصر المعطلة في دورة الإغلاق.'
                : 'Visually explore how work packages, rules, gates, and gaps interconnect and identify blocking items in the closure loop.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterEntity}
              onChange={e => setFilterEntity(e.target.value)}
              className="bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
            >
              <option value="all">{isArabic ? 'جميع الكيانات المرتبطة' : 'All Connected Entities'}</option>
              <option value="wps">{isArabic ? 'حزم العمل (WPS)' : 'Work Packages (WPS)'}</option>
              <option value="gate">{isArabic ? 'بوابات الإغلاق (Gates)' : 'Closure Gates'}</option>
              <option value="gap">{isArabic ? 'الفجوات (Gaps / Findings)' : 'Findings & Gaps'}</option>
              <option value="rule">{isArabic ? 'القواعد (Rules)' : 'Rules'}</option>
            </select>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Graph Canvas Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden flex items-center justify-center min-h-[550px]">
          <svg ref={svgRef} className="w-full h-[550px] bg-slate-950 rounded-xl border border-slate-800/80" />
          <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-2 rounded-xl text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> WPS</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Gates</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Gaps</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Rules</span>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>{isArabic ? 'تفاصيل العنصر المحدد' : 'Node Inspector'}</span>
            </h3>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-teal-400 font-mono font-bold block">{selectedNode.rid}</span>
                  <p className="text-white font-bold">{selectedNode.title}</p>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isArabic ? 'نوع الكيان:' : 'Entity:'}</span>
                  <span className="text-slate-200 font-mono">{selectedNode.entity}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isArabic ? 'القسم:' : 'Department:'}</span>
                  <span className="text-slate-200 font-medium">{selectedNode.department}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isArabic ? 'الحالة:' : 'Status:'}</span>
                  <span className="text-teal-300 font-bold">{selectedNode.status}</span>
                </div>
                {selectedNode.description && (
                  <p className="text-slate-300 pt-2 border-t border-slate-800 leading-relaxed text-[11px]">
                    {selectedNode.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                {isArabic ? 'انقر على أي عقدة في الرسم البياني لاستعراض تفاصيلها وعلاقاتها.' : 'Click any node in the graph to inspect its details and interdependencies.'}
              </div>
            )}
          </div>

          {selectedNode && (
            <button
              onClick={() => onSelectRecord(selectedNode)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all"
            >
              {isArabic ? 'فتح السجل الكامل' : 'Open Full Record'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

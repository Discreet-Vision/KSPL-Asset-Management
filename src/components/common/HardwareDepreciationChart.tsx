import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ConfigurationItem, DepreciationSchedule } from '../../types';
import {
  TrendingDown,
  DollarSign,
  Calendar,
  Info,
  Layers,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface HardwareDepreciationChartProps {
  hardwareAssets: ConfigurationItem[];
  depreciationSchedules?: DepreciationSchedule[];
}

export interface DepreciationPoint {
  date: Date;
  monthIndex: number;
  label: string;
  straightLineBookValue: number;
  decliningBalanceBookValue: number;
  sumOfYearsDigitsBookValue: number;
  accumulatedStraightLine: number;
  accumulatedDeclining: number;
  accumulatedSumOfYears: number;
  periodStraightLineExpense: number;
  periodDecliningExpense: number;
  periodSumOfYearsExpense: number;
}

export interface AssetFinancialProfile {
  assetId: string;
  assetName: string;
  assetTag: string;
  category: string;
  manufacturer: string;
  model: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  startDate: Date;
  currentBookValue: number;
  accumulatedDepreciation: number;
}

export const HardwareDepreciationChart: React.FC<HardwareDepreciationChartProps> = ({
  hardwareAssets = [],
  depreciationSchedules = [],
}) => {
  const safeHardwareAssets = hardwareAssets || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [selectedAssetId, setSelectedAssetId] = useState<string>('ALL');
  const [depreciationMethod, setDepreciationMethod] = useState<'straight-line' | 'declining' | 'sum-of-years' | 'compare'>('compare');
  const [timeGranularity, setTimeGranularity] = useState<'monthly' | 'yearly'>('yearly');
  const [showTable, setShowTable] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<DepreciationPoint | null>(null);

  // Map each hardware asset to a financial profile
  const assetProfiles = useMemo<AssetFinancialProfile[]>(() => {
    return safeHardwareAssets.map((asset) => {
      // Check if there's an explicit schedule in AppContext
      const schedule = depreciationSchedules.find((s) => s.assetId === asset.id);

      let purchaseCost = 5000;
      let salvageValue = 500;
      let usefulLifeYears = 4;
      let startDateStr = '2024-01-01';

      if (schedule) {
        purchaseCost = schedule.purchaseCost;
        salvageValue = schedule.salvageValue;
        usefulLifeYears = schedule.usefulLifeYears;
        startDateStr = schedule.startDate;
      } else {
        // Derive defaults based on asset attributes
        if (asset.model.toLowerCase().includes('poweredge') || asset.model.toLowerCase().includes('server')) {
          purchaseCost = 28500;
          salvageValue = 2000;
          usefulLifeYears = 5;
          startDateStr = '2023-12-15';
        } else if (asset.model.toLowerCase().includes('macbook') || asset.model.toLowerCase().includes('m3')) {
          purchaseCost = 3400;
          salvageValue = 400;
          usefulLifeYears = 3;
          startDateStr = '2024-01-10';
        } else if (asset.model.toLowerCase().includes('thinkpad') || asset.model.toLowerCase().includes('laptop')) {
          purchaseCost = 2400;
          salvageValue = 200;
          usefulLifeYears = 3;
          startDateStr = '2024-03-01';
        } else if (asset.model.toLowerCase().includes('cisco') || asset.model.toLowerCase().includes('switch')) {
          purchaseCost = 12500;
          salvageValue = 1000;
          usefulLifeYears = 7;
          startDateStr = '2022-06-01';
        } else {
          purchaseCost = 4500;
          salvageValue = 450;
          usefulLifeYears = 4;
          startDateStr = '2024-02-01';
        }
      }

      const startDate = new Date(startDateStr);
      const today = new Date('2026-08-11'); // App current date
      const elapsedMonths = Math.max(0, (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth()));
      const totalMonths = usefulLifeYears * 12;

      // Straight-line current book value calculation
      const monthlyDepr = (purchaseCost - salvageValue) / totalMonths;
      const accumDepr = Math.min(purchaseCost - salvageValue, monthlyDepr * elapsedMonths);
      const currentBookValue = Math.max(salvageValue, purchaseCost - accumDepr);

      return {
        assetId: asset.id,
        assetName: asset.name,
        assetTag: asset.assetTag,
        category: asset.category,
        manufacturer: asset.manufacturer,
        model: asset.model,
        purchaseCost,
        salvageValue,
        usefulLifeYears,
        startDate,
        currentBookValue,
        accumulatedDepreciation: accumDepr,
      };
    });
  }, [hardwareAssets, depreciationSchedules]);

  // Selected profile or aggregated profile
  const activeProfile = useMemo(() => {
    const fallbackProfile = {
      assetId: 'ALL',
      assetName: 'All Hardware Portfolio',
      assetTag: 'FLEET-TOTAL',
      category: 'Hardware',
      manufacturer: 'Multiple',
      model: 'Fleet Aggregate',
      purchaseCost: 0,
      salvageValue: 0,
      usefulLifeYears: 5,
      startDate: new Date('2023-01-01'),
      currentBookValue: 0,
      accumulatedDepreciation: 0,
    };

    if (!assetProfiles || assetProfiles.length === 0) {
      return fallbackProfile;
    }

    if (selectedAssetId !== 'ALL') {
      return assetProfiles.find((p) => p.assetId === selectedAssetId) || assetProfiles[0] || fallbackProfile;
    }

    const totalCost = assetProfiles.reduce((acc, curr) => acc + (curr?.purchaseCost || 0), 0);
    const totalSalvage = assetProfiles.reduce((acc, curr) => acc + (curr?.salvageValue || 0), 0);
    const avgLife = Math.max(1, Math.round(assetProfiles.reduce((acc, curr) => acc + (curr?.usefulLifeYears || 0), 0) / assetProfiles.length));
    const totalCurrentValue = assetProfiles.reduce((acc, curr) => acc + (curr?.currentBookValue || 0), 0);
    const totalAccum = assetProfiles.reduce((acc, curr) => acc + (curr?.accumulatedDepreciation || 0), 0);
    const timestamps = assetProfiles.map((p) => (p?.startDate ? p.startDate.getTime() : Date.now())).filter((t) => !isNaN(t));
    const earliestStart = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : new Date('2023-01-01');

    return {
      assetId: 'ALL',
      assetName: `Total Hardware Fleet (${assetProfiles.length} Assets)`,
      assetTag: 'FLEET-TOTAL',
      category: 'Hardware Portfolio',
      manufacturer: 'Enterprise Hardware',
      model: 'Combined Portfolio',
      purchaseCost: totalCost,
      salvageValue: totalSalvage,
      usefulLifeYears: avgLife,
      startDate: earliestStart,
      currentBookValue: totalCurrentValue,
      accumulatedDepreciation: totalAccum,
    };
  }, [selectedAssetId, assetProfiles]);

  // Generate Depreciation Time Series
  const timelineData = useMemo<DepreciationPoint[]>(() => {
    if (!activeProfile) return [];

    const isFleet = selectedAssetId === 'ALL';
    const profilesToCalculate = isFleet ? assetProfiles : [activeProfile];

    if (profilesToCalculate.length === 0) return [];

    // Max lifespan across profiles
    const maxYears = Math.max(...profilesToCalculate.map((p) => p.usefulLifeYears), 5);
    const stepCount = timeGranularity === 'monthly' ? maxYears * 12 : maxYears;
    const points: DepreciationPoint[] = [];

    // Reference start date
    const baseDate = isFleet
      ? new Date(Math.min(...profilesToCalculate.map((p) => p.startDate.getTime())))
      : activeProfile.startDate;

    for (let i = 0; i <= stepCount; i++) {
      const pointDate = new Date(baseDate);
      if (timeGranularity === 'monthly') {
        pointDate.setMonth(pointDate.getMonth() + i);
      } else {
        pointDate.setFullYear(pointDate.getFullYear() + i);
      }

      let slBookTotal = 0;
      let dbBookTotal = 0;
      let sydBookTotal = 0;

      let slAccumTotal = 0;
      let dbAccumTotal = 0;
      let sydAccumTotal = 0;

      let slExpenseTotal = 0;
      let dbExpenseTotal = 0;
      let sydExpenseTotal = 0;

      profilesToCalculate.forEach((p) => {
        const totalMonths = p.usefulLifeYears * 12;
        const totalYears = p.usefulLifeYears;
        const cost = p.purchaseCost;
        const salvage = p.salvageValue;
        const depreciableBase = cost - salvage;

        // Months/Years elapsed from this specific asset's start date to pointDate
        let monthsElapsed = (pointDate.getFullYear() - p.startDate.getFullYear()) * 12 + (pointDate.getMonth() - p.startDate.getMonth());
        if (monthsElapsed < 0) monthsElapsed = 0;

        let yearsElapsed = monthsElapsed / 12;
        if (yearsElapsed > totalYears) yearsElapsed = totalYears;

        // 1. STRAIGHT LINE
        const slMonthlyDepr = depreciableBase / totalMonths;
        const slCurrentAccum = Math.min(depreciableBase, slMonthlyDepr * monthsElapsed);
        const slBook = Math.max(salvage, cost - slCurrentAccum);

        // 2. DOUBLE DECLINING BALANCE (200% DB)
        // Rate = 2 / N
        const dbRate = 2 / totalYears;
        let dbBook = cost;
        let dbAccum = 0;
        let dbPrevBook = cost;

        // Annual iteration for DB
        const fullYearsPassed = Math.floor(yearsElapsed);
        const fractionOfYear = yearsElapsed - fullYearsPassed;

        for (let y = 1; y <= fullYearsPassed; y++) {
          const annualExpense = Math.min(dbBook - salvage, dbBook * dbRate);
          dbBook -= annualExpense;
        }
        if (fractionOfYear > 0 && dbBook > salvage) {
          const annualExpense = Math.min(dbBook - salvage, dbBook * dbRate);
          dbBook -= annualExpense * fractionOfYear;
        }
        dbBook = Math.max(salvage, dbBook);
        dbAccum = cost - dbBook;

        // 3. SUM-OF-THE-YEARS'-DIGITS (SYD)
        // SYD = N*(N+1)/2
        const sydSum = (totalYears * (totalYears + 1)) / 2;
        let sydBook = cost;
        let sydAccum = 0;

        for (let y = 1; y <= fullYearsPassed; y++) {
          const yearWeight = (totalYears - y + 1) / sydSum;
          const annualExpense = depreciableBase * yearWeight;
          sydBook -= annualExpense;
        }
        if (fractionOfYear > 0 && sydBook > salvage) {
          const currentYear = fullYearsPassed + 1;
          if (currentYear <= totalYears) {
            const yearWeight = (totalYears - currentYear + 1) / sydSum;
            const annualExpense = depreciableBase * yearWeight;
            sydBook -= annualExpense * fractionOfYear;
          }
        }
        sydBook = Math.max(salvage, sydBook);
        sydAccum = cost - sydBook;

        slBookTotal += slBook;
        dbBookTotal += dbBook;
        sydBookTotal += sydBook;

        slAccumTotal += slCurrentAccum;
        dbAccumTotal += dbAccum;
        sydAccumTotal += sydAccum;
      });

      const label =
        timeGranularity === 'monthly'
          ? pointDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          : `Year ${i} (${pointDate.getFullYear()})`;

      points.push({
        date: pointDate,
        monthIndex: i,
        label,
        straightLineBookValue: Math.round(slBookTotal),
        decliningBalanceBookValue: Math.round(dbBookTotal),
        sumOfYearsDigitsBookValue: Math.round(sydBookTotal),
        accumulatedStraightLine: Math.round(slAccumTotal),
        accumulatedDeclining: Math.round(dbAccumTotal),
        accumulatedSumOfYears: Math.round(sydAccumTotal),
        periodStraightLineExpense: slExpenseTotal,
        periodDecliningExpense: dbExpenseTotal,
        periodSumOfYearsExpense: sydExpenseTotal,
      });
    }

    return points;
  }, [activeProfile, selectedAssetId, assetProfiles, timeGranularity]);

  // Render D3 Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || timelineData.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 360;
    const margin = { top: 30, right: 30, bottom: 40, left: 70 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Scales
    const xDomain = d3.extent(timelineData, (d: DepreciationPoint) => d.date) as [Date, Date];
    const xScale = d3.scaleTime()
      .domain(xDomain)
      .range([margin.left, width - margin.right]);

    const maxVal = d3.max(timelineData, (d: DepreciationPoint) =>
      Math.max(d.straightLineBookValue, d.decliningBalanceBookValue, d.sumOfYearsDigitsBookValue)
    ) || 10000;

    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.08])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Defs (Gradients)
    const defs = svg.append('defs');

    // Gradient 1: Straight Line Fill
    const gradSL = defs.append('linearGradient')
      .attr('id', 'grad-straight-line')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradSL.append('stop').attr('offset', '0%').attr('stop-color', '#D3D3D3').attr('stop-opacity', 0.25);
    gradSL.append('stop').attr('offset', '100%').attr('stop-color', '#D3D3D3').attr('stop-opacity', 0.0);

    // Gradient 2: Declining Balance Fill
    const gradDB = defs.append('linearGradient')
      .attr('id', 'grad-declining')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradDB.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.25);
    gradDB.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.0);

    // Gradient 3: SYD Fill
    const gradSYD = defs.append('linearGradient')
      .attr('id', 'grad-syd')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradSYD.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.25);
    gradSYD.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // Grid Lines
    const yGrid = d3.axisLeft(yScale)
      .ticks(6)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat(() => '');

    svg.append('g')
      .attr('class', 'grid-lines')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#e4e4e7')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(timelineData.length, 8))
      .tickFormat((d) => d3.timeFormat(timeGranularity === 'monthly' ? '%b %y' : '%Y')(d as Date));

    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `$${d3.format(',.0f')(d)}`);

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#3f3f46')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('color', '#3f3f46')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px');

    // Salvage Floor Threshold Line
    const salvageFloor = activeProfile ? activeProfile.salvageValue : 0;
    if (salvageFloor > 0) {
      svg.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yScale(salvageFloor))
        .attr('y2', yScale(salvageFloor))
        .attr('stroke', '#9ca3af')
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 1.5);

      svg.append('text')
        .attr('x', width - margin.right)
        .attr('y', yScale(salvageFloor) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#4b5563')
        .attr('font-family', 'monospace')
        .attr('font-size', '9px')
        .text(`Salvage Floor: $${d3.format(',')(salvageFloor)}`);
    }

    // Line & Area Generators
    const areaGeneratorSL = d3.area<DepreciationPoint>()
      .x((d) => xScale(d.date))
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.straightLineBookValue))
      .curve(d3.curveMonotoneX);

    const lineGeneratorSL = d3.line<DepreciationPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.straightLineBookValue))
      .curve(d3.curveMonotoneX);

    const lineGeneratorDB = d3.line<DepreciationPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.decliningBalanceBookValue))
      .curve(d3.curveMonotoneX);

    const lineGeneratorSYD = d3.line<DepreciationPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.sumOfYearsDigitsBookValue))
      .curve(d3.curveMonotoneX);

    // Render Areas & Lines depending on selected method
    if (depreciationMethod === 'straight-line' || depreciationMethod === 'compare') {
      svg.append('path')
        .datum(timelineData)
        .attr('fill', 'url(#grad-straight-line)')
        .attr('d', areaGeneratorSL);

      const pathSL = svg.append('path')
        .datum(timelineData)
        .attr('fill', 'none')
        .attr('stroke', '#D3D3D3')
        .attr('stroke-width', 2.5)
        .attr('d', lineGeneratorSL);

      // Animate stroke
      const totalLength = (pathSL.node() as SVGPathElement)?.getTotalLength() || 0;
      pathSL
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    if (depreciationMethod === 'declining' || depreciationMethod === 'compare') {
      const pathDB = svg.append('path')
        .datum(timelineData)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', depreciationMethod === 'compare' ? '5,5' : '0')
        .attr('d', lineGeneratorDB);

      const totalLength = (pathDB.node() as SVGPathElement)?.getTotalLength() || 0;
      pathDB
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    if (depreciationMethod === 'sum-of-years' || depreciationMethod === 'compare') {
      const pathSYD = svg.append('path')
        .datum(timelineData)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', depreciationMethod === 'compare' ? '2,2' : '0')
        .attr('d', lineGeneratorSYD);

      const totalLength = (pathSYD.node() as SVGPathElement)?.getTotalLength() || 0;
      pathSYD
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Today Marker Line
    const today = new Date('2026-08-11');
    if (today >= xDomain[0] && today <= xDomain[1]) {
      const todayX = xScale(today);
      svg.append('line')
        .attr('x1', todayX)
        .attr('x2', todayX)
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,3');

      svg.append('text')
        .attr('x', todayX)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#60a5fa')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('font-size', '10px')
        .text('TODAY (AUG 2026)');
    }

    // Interactive Hover Crosshair
    const focusG = svg.append('g').style('display', 'none');

    const hoverLine = focusG.append('line')
      .attr('stroke', '#71717a')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    const circleSL = focusG.append('circle').attr('r', 5).attr('fill', '#D3D3D3').attr('stroke', '#ffffff').attr('stroke-width', 1.5);
    const circleDB = focusG.append('circle').attr('r', 5).attr('fill', '#f59e0b').attr('stroke', '#ffffff').attr('stroke-width', 1.5);
    const circleSYD = focusG.append('circle').attr('r', 5).attr('fill', '#06b6d4').attr('stroke', '#ffffff').attr('stroke-width', 1.5);

    const overlay = svg.append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    const bisectDate = d3.bisector<DepreciationPoint, Date>((d) => d.date).left;

    overlay
      .on('mouseenter', () => focusG.style('display', null))
      .on('mouseleave', () => {
        focusG.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [xPos] = d3.pointer(event);
        const xDate = xScale.invert(xPos);
        const idx = bisectDate(timelineData, xDate, 1);
        const d0 = timelineData[idx - 1];
        const d1 = timelineData[idx];
        let d = d0;
        if (d0 && d1) {
          d = xDate.getTime() - d0.date.getTime() > d1.date.getTime() - xDate.getTime() ? d1 : d0;
        }

        if (d) {
          const cx = xScale(d.date);
          hoverLine.attr('x1', cx).attr('x2', cx);

          circleSL.attr('cx', cx).attr('cy', yScale(d.straightLineBookValue));
          circleDB.attr('cx', cx).attr('cy', yScale(d.decliningBalanceBookValue));
          circleSYD.attr('cx', cx).attr('cy', yScale(d.sumOfYearsDigitsBookValue));

          setHoveredPoint(d);
        }
      });
  }, [timelineData, depreciationMethod, timeGranularity, activeProfile]);

  // Download CSV
  const handleExportCSV = () => {
    if (timelineData.length === 0) return;
    const headers = [
      'Period',
      'Date',
      'Straight-Line Book Value ($)',
      'Declining Balance Book Value ($)',
      'Sum-Of-Years Book Value ($)',
      'Straight-Line Accum ($)',
    ];
    const rows = timelineData.map((d) => [
      d.label,
      d.date.toISOString().substring(0, 10),
      d.straightLineBookValue,
      d.decliningBalanceBookValue,
      d.sumOfYearsDigitsBookValue,
      d.accumulatedStraightLine,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `depreciation_${activeProfile.assetTag}_${timeGranularity}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-5 text-white font-sans">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-black tracking-tight uppercase text-white">
              FINANCIAL DEPRECIATION & ASSET VALUE DECAY (D3)
            </h2>
            <span className="bg-red-500/10 text-red-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-red-500/20">
              GAAP / IFRS Compliant
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Interactive D3 visualization modeling salvage floor thresholds, straight-line, 200% declining balance, and SYD decay
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Asset Selector */}
          <div className="flex items-center space-x-1.5 bg-black border border-zinc-800 px-2.5 py-1.5 rounded">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="ALL">All Hardware Fleet ({safeHardwareAssets.length} Items)</option>
              {assetProfiles.map((p) => (
                <option key={p.assetId} value={p.assetId}>
                  {p.assetTag} - {p.assetName}
                </option>
              ))}
            </select>
          </div>

          {/* Granularity Toggle */}
          <div className="flex items-center bg-black border border-zinc-800 rounded p-0.5">
            <button
              onClick={() => setTimeGranularity('yearly')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                timeGranularity === 'yearly' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setTimeGranularity('monthly')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                timeGranularity === 'monthly' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-black border border-zinc-800 p-3 rounded-lg space-y-1">
          <div className="text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-between">
            <span>Initial Acquisition Cost</span>
            <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-lg font-black text-white">
            ${activeProfile.purchaseCost.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            Baseline Capital Expenditure (CapEx)
          </div>
        </div>

        <div className="bg-black border border-zinc-800 p-3 rounded-lg space-y-1">
          <div className="text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-between">
            <span>Current Net Book Value</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400">
            ${Math.round(activeProfile.currentBookValue).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            As of Aug 2026 ({Math.round((activeProfile.currentBookValue / (activeProfile.purchaseCost || 1)) * 100)}% Remaining)
          </div>
        </div>

        <div className="bg-black border border-zinc-800 p-3 rounded-lg space-y-1">
          <div className="text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-between">
            <span>Accumulated Depreciation</span>
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-lg font-black text-red-400">
            ${Math.round(activeProfile.accumulatedDepreciation).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            Total Expense Recognized to Date
          </div>
        </div>

        <div className="bg-black border border-zinc-800 p-3 rounded-lg space-y-1">
          <div className="text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-between">
            <span>Salvage Floor & Lifespan</span>
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-black text-cyan-400">
            ${activeProfile.salvageValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            Useful Life: {activeProfile.usefulLifeYears} Years
          </div>
        </div>
      </div>

      {/* Depreciation Method Selector Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black p-2 border border-zinc-800 rounded font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-zinc-400 text-[11px] font-bold">Accounting Method:</span>
          <button
            onClick={() => setDepreciationMethod('compare')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              depreciationMethod === 'compare'
                ? 'bg-red-600 text-white'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            Compare All Models
          </button>
          <button
            onClick={() => setDepreciationMethod('straight-line')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              depreciationMethod === 'straight-line'
                ? 'bg-red-600 text-white'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>Straight-Line (SL)</span>
          </button>
          <button
            onClick={() => setDepreciationMethod('declining')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              depreciationMethod === 'declining'
                ? 'bg-amber-600 text-white'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>200% Declining Balance (DB)</span>
          </button>
          <button
            onClick={() => setDepreciationMethod('sum-of-years')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              depreciationMethod === 'sum-of-years'
                ? 'bg-cyan-600 text-white'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
            <span>Sum-of-Years' Digits (SYD)</span>
          </button>
        </div>

        <button
          onClick={() => setShowTable((prev) => !prev)}
          className="text-xs text-red-400 hover:text-red-300 underline font-mono cursor-pointer"
        >
          {showTable ? 'Hide Schedule Table' : 'View Schedule Table'}
        </button>
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="relative bg-black border border-zinc-800 rounded-lg p-2 overflow-hidden">
        <svg ref={svgRef} className="w-full h-[360px]" />

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded p-3 shadow-xl text-xs font-mono space-y-1.5 w-64">
            <div className="text-white font-bold border-b border-zinc-800 pb-1 flex justify-between">
              <span>{hoveredPoint.label}</span>
              <span className="text-zinc-400">{hoveredPoint.date.toLocaleDateString()}</span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-red-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  <span>Straight-Line:</span>
                </span>
                <span className="font-bold text-white">${hoveredPoint.straightLineBookValue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-amber-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span>Declining Bal (200%):</span>
                </span>
                <span className="font-bold text-white">${hoveredPoint.decliningBalanceBookValue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-cyan-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
                  <span>Sum-of-Years:</span>
                </span>
                <span className="font-bold text-white">${hoveredPoint.sumOfYearsDigitsBookValue.toLocaleString()}</span>
              </div>

              <div className="border-t border-zinc-800 pt-1 text-[10px] text-zinc-400 flex justify-between">
                <span>Straight-Line Accum:</span>
                <span className="text-red-400 font-bold">${hoveredPoint.accumulatedStraightLine.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Table */}
      {showTable && (
        <div className="bg-black border border-zinc-800 rounded-lg overflow-x-auto font-mono text-xs">
          <div className="p-3 bg-zinc-900 border-b border-zinc-800 font-bold text-zinc-300 flex justify-between">
            <span>DEPRECIATION SCHEDULE BREAKDOWN ({timelineData.length} PERIODS)</span>
            <span className="text-zinc-500 text-[10px]">Asset: {activeProfile.assetName}</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-2.5">Period</th>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Straight-Line Book</th>
                <th className="p-2.5">Declining Balance Book</th>
                <th className="p-2.5">Sum-of-Years Book</th>
                <th className="p-2.5">SL Accumulated Depr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {timelineData.map((pt, i) => (
                <tr key={i} className="hover:bg-zinc-900/50">
                  <td className="p-2.5 font-bold text-white">{pt.label}</td>
                  <td className="p-2.5 text-zinc-400">{pt.date.toLocaleDateString()}</td>
                  <td className="p-2.5 font-bold text-red-400">${pt.straightLineBookValue.toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-amber-400">${pt.decliningBalanceBookValue.toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-cyan-400">${pt.sumOfYearsDigitsBookValue.toLocaleString()}</td>
                  <td className="p-2.5 text-zinc-400">${pt.accumulatedStraightLine.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import {NgZone, Component, Inject, Input, OnInit} from '@angular/core';

import Models = require('../share/models');
import {SubscriberFactory} from './shared_directives';

@Component({
  selector: 'trade-safety',
  template: `<div div class="tradeSafety img-rounded"><div>
      Fair Value: <span class="{{ fairValue ? \'text-danger fairvalue\' : \'text-muted\' }}" style="font-size:121%;">{{ fairValue | number:'1.'+product.fixed+'-'+product.fixed }}</span>,
      BuyPing: <span class="{{ buySizeSafety ? \'text-danger\' : \'text-muted\' }}">{{ buySizeSafety | number:'1.'+product.fixed+'-'+product.fixed }}</span>,
      SellPing: <span class="{{ sellSizeSafety ? \'text-danger\' : \'text-muted\' }}">{{ sellSizeSafety | number:'1.'+product.fixed+'-'+product.fixed }}</span>,
      BuyTS: <span class="{{ buySafety ? \'text-danger\' : \'text-muted\' }}">{{ buySafety | number:'1.2-2' }}</span>,
      SellTS: <span class="{{ sellSafety ? \'text-danger\' : \'text-muted\' }}">{{ sellSafety | number:'1.2-2' }}</span>,
      TotalTS: <span class="{{ tradeSafetyValue ? \'text-danger\' : \'text-muted\' }}">{{ tradeSafetyValue | number:'1.2-2' }}</span>,
      openOrders/60sec: <span class="{{ tradeFreq ? \'text-danger\' : \'text-muted\' }}">{{ tradeFreq }}</span>
<span style="float:right;"><span title="{{ baseSymbol }} profit % since last hour" class="{{ profitBase ? \'text-danger\' : \'text-muted\' }}">{{ profitBase>=0?'+':'' }}{{ profitBase | number:'1.2-2' }}%</span>, <span title="{{ quoteSymbol }} profit % since last hour" class="{{ profitQuote ? \'text-danger\' : \'text-muted\' }}">{{ profitQuote>=0?'+':'' }}{{ profitQuote | number:'1.2-2' }}%</span></span>
    </div>
  </div>`
})
export class TradeSafetyComponent implements OnInit {

  public fairValue: number;
  private buySafety: number;
  public baseSymbol: string;
  private quoteSymbol: string;
  private sellSafety: number;
  private buySizeSafety: number ;
  private sellSizeSafety: number;
  private tradeSafetyValue: number;
  private profitBase: number;
  private profitQuote: number;
  @Input() tradeFreq: number;
  @Input() product: Models.ProductState;

  constructor(
    @Inject(NgZone) private zone: NgZone,
    @Inject(SubscriberFactory) private subscriberFactory: SubscriberFactory
  ) {}

  ngOnInit() {
    this.subscriberFactory
      .getSubscriber(this.zone, Models.Topics.FairValue)
      .registerConnectHandler(this.clearFairValue)
      .registerSubscriber(this.updateFairValue);

    this.subscriberFactory
      .getSubscriber(this.zone, Models.Topics.TradeSafetyValue)
      .registerConnectHandler(this.clear)
      .registerSubscriber(this.updateValues);
  }

  private updateValues = (value : Models.TradeSafety) => {
    if (value == null) return;
    this.tradeSafetyValue = value.combined;
    this.buySafety = value.buy;
    this.sellSafety = value.sell;
    this.buySizeSafety = value.buyPing;
    this.sellSizeSafety = value.sellPong;
    this.profitBase = value.profitBase;
    this.profitQuote = value.profitQuote;
    if (!this.baseSymbol) this.baseSymbol = Models.Currency[this.product.advert.pair.base];
    if (!this.quoteSymbol) this.quoteSymbol = Models.Currency[this.product.advert.pair.quote];
  }

  private updateFairValue = (fv: Models.FairValue) => {
    if (fv == null) {
      this.clearFairValue();
      return;
    }

    this.fairValue = fv.price;
  }

  private clearFairValue = () => {
    this.fairValue = null;
  }

  private clear = () => {
    this.tradeSafetyValue = null;
    this.buySafety = null;
    this.sellSafety = null;
    this.buySizeSafety = null;
    this.sellSizeSafety = null;
    this.profitBase = null;
    this.profitQuote = null;
  }
}
